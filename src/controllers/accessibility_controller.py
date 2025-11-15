"""Accessibility commitments and WCAG conformance reporting."""
from flask import Blueprint, render_template

from src.services.accessibility_audit import AccessibilityAuditService

accessibility_bp = Blueprint('accessibility', __name__, url_prefix='/accessibility')


def _manual_checklist():
    return [
        {
            'title': 'Keyboard-only navigation',
            'description': 'Press Tab / Shift+Tab through the navbar, hero CTA, resource cards, and booking forms.'
                           ' Every control must be reachable and show a visible focus outline.',
            'expected': 'Focus ring is visible, no keyboard traps exist, and skip link appears when focused.'
        },
        {
            'title': 'Screen reader announcements',
            'description': 'Trigger flash messages (login errors, booking approvals) and ensure the live region announces them.',
            'expected': 'Announcements are read once without duplicates thanks to aria-live="polite" and aria-atomic="true".'
        },
        {
            'title': 'Reduced motion preference',
            'description': 'Enable prefers-reduced-motion at the OS level and reload the page.',
            'expected': 'Non-essential animations soften or disable, avoiding parallax that could trigger motion sensitivity.'
        }
    ]


def _tooling_links():
    return [
        {
            'name': 'axe DevTools Quick Check',
            'url': 'https://www.deque.com/axe/browser-extensions/',
            'notes': 'Great for quick WCAG regression scans in Chrome or Firefox.'
        },
        {
            'name': 'WAVE Evaluation Tool',
            'url': 'https://wave.webaim.org/',
            'notes': 'Visual overlay that highlights landmarks, headings, and contrast warnings.'
        },
        {
            'name': 'Color Contrast Analyzer',
            'url': 'https://www.tpgi.com/color-contrast-checker/',
            'notes': 'Desktop utility to validate bespoke marketing assets or uploaded images.'
        }
    ]


def _guiding_principles():
    return [
        {
            'title': 'Perceivable',
            'detail': 'Color choices, iconography, and messaging leverage redundant cues and pass WCAG contrast targets.'
        },
        {
            'title': 'Operable',
            'detail': 'Every workflow supports keyboard interactions, logical focus management, and clear skip links.'
        },
        {
            'title': 'Understandable',
            'detail': 'Forms pair labels with instructions, expose validation inline, and use plain language.'
        },
        {
            'title': 'Robust',
            'detail': 'Landmarks, ARIA attributes, and semantic HTML reinforce assistive technology compatibility.'
        }
    ]


@accessibility_bp.route('/')
def overview():
    audit = AccessibilityAuditService().run()
    return render_template(
        'accessibility/overview.html',
        audit=audit,
        manual_checks=_manual_checklist(),
        tools=_tooling_links(),
        principles=_guiding_principles()
    )
