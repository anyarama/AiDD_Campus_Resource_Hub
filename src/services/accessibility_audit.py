"""
Accessibility audit utilities used to benchmark the UI against WCAG guidance.

The goal is not to replace full tooling such as axe-core, but to provide
lightweight guardrails directly inside the application. We focus on
programmable checks that can run without a browser:

1. Color contrast validation for the design tokens used throughout the UI.
2. Template heuristics that ensure global landmarks and live regions exist.

The results are surfaced inside the /accessibility route so designers and
admins can quickly spot regressions during development.
"""
from __future__ import annotations

from dataclasses import dataclass
from pathlib import Path
from typing import Dict, Iterable, List, Tuple


DEFAULT_THEME_CHECKS: Tuple[Dict[str, str], ...] = (
    {
        'name': 'Primary action buttons',
        'usage': 'Applies to crimson CTAs and nav accent pills.',
        'foreground': '#ffffff',
        'background': '#990000',
        'min_ratio': 4.5
    },
    {
        'name': 'Hero body copy',
        'usage': 'Standard text on sand/cream hero surfaces.',
        'foreground': '#2b1f1a',
        'background': '#fdf8f4',
        'min_ratio': 4.5
    },
    {
        'name': 'Card borders vs. surface',
        'usage': 'Muted borders on white cards.',
        'foreground': '#979087',
        'background': '#ffffff',
        'min_ratio': 3.0  # large text/graphic elements
    },
    {
        'name': 'Footer links',
        'usage': 'Link text against the footer background.',
        'foreground': '#990000',
        'background': '#fdf8f4',
        'min_ratio': 4.5
    }
)


STRUCTURE_RULES: Tuple[Tuple[str, str, str], ...] = (
    (
        'skip_link',
        'Skip navigation link',
        'Allows keyboard and assistive tech users to bypass the global nav.'
    ),
    (
        'main_landmark',
        'Focusable main landmark',
        'Provides an explicit target for skip links and screen reader regions.'
    ),
    (
        'flash_region',
        'ARIA live region for flash messages',
        'Surfaces toast/alert updates to screen reader users automatically.'
    ),
    (
        'nav_toggler',
        'Accessible mobile navigation toggle',
        'Ensures aria-controls/label attributes are exposed when the menu collapses.'
    )
)


@dataclass
class ContrastCheckResult:
    """Represents the outcome of a single contrast evaluation."""

    name: str
    usage: str
    ratio: float
    min_ratio: float
    wcag_rating: str
    passes: bool
    foreground: str
    background: str
    recommendation: str


def _hex_to_rgb(color: str) -> Tuple[float, float, float]:
    """Convert hex colors to normalized RGB triples."""
    value = color.lstrip('#')
    if len(value) not in (3, 6):
        raise ValueError(f'Invalid color value: {color}')
    if len(value) == 3:
        value = ''.join(ch * 2 for ch in value)
    r = int(value[0:2], 16) / 255.0
    g = int(value[2:4], 16) / 255.0
    b = int(value[4:6], 16) / 255.0
    return r, g, b


def _relative_luminance(color: str) -> float:
    """Return the relative luminance as defined by WCAG."""
    def linearize(channel: float) -> float:
        return channel / 12.92 if channel <= 0.03928 else ((channel + 0.055) / 1.055) ** 2.4

    r, g, b = _hex_to_rgb(color)
    r_lin, g_lin, b_lin = map(linearize, (r, g, b))
    return 0.2126 * r_lin + 0.7152 * g_lin + 0.0722 * b_lin


def contrast_ratio(foreground: str, background: str) -> float:
    """
    Compute the WCAG contrast ratio between two colors.

    Returns:
        float: ratio rounded to two decimals.
    """
    fg_lum = _relative_luminance(foreground)
    bg_lum = _relative_luminance(background)
    lighter = max(fg_lum, bg_lum)
    darker = min(fg_lum, bg_lum)
    ratio = (lighter + 0.05) / (darker + 0.05)
    return round(ratio, 2)


class AccessibilityAuditService:
    """Performs static checks to keep the UI aligned with WCAG guidance."""

    def __init__(
        self,
        project_root: Path | None = None,
        theme_checks: Iterable[Dict[str, str]] = DEFAULT_THEME_CHECKS
    ) -> None:
        self.project_root = Path(project_root) if project_root else Path(__file__).resolve().parent.parent
        self.theme_checks = tuple(theme_checks)
        self._layout_markup = None

    # ---------------------
    # Public API
    # ---------------------
    def run(self) -> Dict[str, List[Dict[str, str]] | Dict[str, float | int | str]]:
        """Execute theme and structural checks and compute a summary."""
        theme_results = self._run_theme_checks()
        structure_results = self._run_structure_checks()
        summary = self._summarize(theme_results, structure_results)
        return {
            'theme_checks': theme_results,
            'structure_checks': structure_results,
            'summary': summary
        }

    # ---------------------
    # Theme checks
    # ---------------------
    def _run_theme_checks(self) -> List[Dict[str, str | float | bool]]:
        reports: List[Dict[str, str | float | bool]] = []
        for check in self.theme_checks:
            ratio = contrast_ratio(check['foreground'], check['background'])
            min_ratio = float(check.get('min_ratio', 4.5))
            passes = ratio >= min_ratio
            rating = self._wcag_rating(ratio)
            recommendation = (
                'Meets WCAG target.' if passes else
                f'Increase contrast to at least {min_ratio}:1 by adjusting {check["foreground"]} or {check["background"]}.'
            )
            reports.append({
                'name': check['name'],
                'usage': check['usage'],
                'ratio': ratio,
                'min_ratio': min_ratio,
                'passes': passes,
                'wcag_rating': rating,
                'foreground': check['foreground'],
                'background': check['background'],
                'recommendation': recommendation
            })
        return reports

    @staticmethod
    def _wcag_rating(ratio: float) -> str:
        if ratio >= 7:
            return 'AAA'
        if ratio >= 4.5:
            return 'AA'
        if ratio >= 3:
            return 'AA (large)'
        return 'Below AA'

    # ---------------------
    # Structure checks
    # ---------------------
    def _run_structure_checks(self) -> List[Dict[str, str]]:
        markup = self._get_layout_markup()
        results: List[Dict[str, str]] = []

        for rule_id, title, description in STRUCTURE_RULES:
            checker = getattr(self, f'_check_{rule_id}')
            status, details = checker(markup)
            results.append({
                'id': rule_id,
                'name': title,
                'description': description,
                'status': 'pass' if status else 'fail',
                'details': details
            })
        return results

    def _check_skip_link(self, markup: str) -> Tuple[bool, str]:
        has_skip = 'class="skip-link"' in markup and 'href="#main-content"' in markup
        details = 'Skip link present with #main-content target.' if has_skip else \
            'Add <a class="skip-link" href="#main-content">Skip to main content</a> near the top of the page.'
        return has_skip, details

    def _check_main_landmark(self, markup: str) -> Tuple[bool, str]:
        has_main = '<main' in markup and 'id="main-content"' in markup and 'tabindex="-1"' in markup
        details = 'Main landmark is focusable and addressable.' if has_main else \
            'Ensure <main id="main-content" tabindex="-1" role="main"> wraps page content.'
        return has_main, details

    def _check_flash_region(self, markup: str) -> Tuple[bool, str]:
        has_live = 'aria-live="polite"' in markup and 'aria-atomic="true"' in markup
        details = 'Flash container exposes aria-live updates.' if has_live else \
            'Mark flash stack with aria-live="polite" aria-atomic="true" for announcements.'
        return has_live, details

    def _check_nav_toggler(self, markup: str) -> Tuple[bool, str]:
        has_label = 'navbar-toggler' in markup and 'aria-label="' in markup and 'aria-controls=' in markup
        details = 'Navbar toggler advertises aria label + controls.' if has_label else \
            'Include aria-label and aria-controls on the .navbar-toggler button.'
        return has_label, details

    # ---------------------
    # Summary helpers
    # ---------------------
    def _summarize(
        self,
        theme_results: List[Dict[str, str | float | bool]],
        structure_results: List[Dict[str, str]]
    ) -> Dict[str, float | int | str | List[str]]:
        total_checks = len(theme_results) + len(structure_results)
        failures = sum(1 for item in theme_results if not item['passes'])
        failures += sum(1 for item in structure_results if item['status'] != 'pass')
        pass_rate = ((total_checks - failures) / total_checks) * 100 if total_checks else 100
        recommendations = [
            item['recommendation'] for item in theme_results if not item['passes']
        ] + [
            item['details'] for item in structure_results if item['status'] != 'pass'
        ]
        return {
            'total_checks': total_checks,
            'failures': failures,
            'pass_rate': round(pass_rate, 1),
            'status': 'On track' if failures == 0 else 'Needs attention',
            'wcag_targets': ['WCAG 2.1 AA', 'Section 508'],
            'recommendations': recommendations
        }

    # ---------------------
    # File helpers
    # ---------------------
    def _get_layout_markup(self) -> str:
        if self._layout_markup is not None:
            return self._layout_markup
        layout_path = self.project_root / 'views' / 'layout.html'
        try:
            self._layout_markup = layout_path.read_text(encoding='utf-8')
        except FileNotFoundError:
            self._layout_markup = ''
        return self._layout_markup

