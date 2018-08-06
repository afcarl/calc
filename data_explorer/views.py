import django.contrib.auth
from django.shortcuts import render
from django.utils.safestring import mark_safe
from django.utils.crypto import get_random_string

from contracts.models import ScheduleMetadata


def about(request):
    return render(request, 'about.html', {
        'current_selected_tab': 'about',
        'schedules': ScheduleMetadata.objects.all().order_by('sin'),
    })


def index(request, template_vars=None):
    return render(request, 'index.html', template_vars or {})


def logout(request):
    django.contrib.auth.logout(request)
    return render(request, 'logged_out.html')


# TODO: Re-enable this eventually. Right now we can't use it because
# we need to use New Relic for front-end error monitoring, and it doesn't
# support CSP in any way.
def index_with_csp(request):
    csp_nonce = get_random_string(length=10)
    response = index(request, template_vars={
        'csp_nonce': mark_safe('nonce="{}"'.format(csp_nonce))  # nosec
    })
    script_src = ' '.join([
        "'self'",
        "*.googleapis.com",
        "dap.digitalgov.gov",
        "www.google-analytics.com",
        "ethn.io",
        # Browsers that don't support CSP v2 need this to work.
        "'unsafe-inline'",
        # For browsers that *do* support CSP v2, the following will
        # override our earlier 'unsafe-inline' directive.
        "'nonce-{}'".format(csp_nonce)
    ])
    response['Content-Security-Policy'] = '; '.join([
        "default-src *",
        "script-src {}".format(script_src),
        "style-src * 'unsafe-inline'",
        "img-src * data:",
    ])
    return response
