import json
from ..models import SubmittedPriceList
from functools import wraps
from django.shortcuts import render, redirect
from django.contrib.auth.decorators import login_required

from ..forms import price_list as forms
from ..schedules import registry
from .common import add_generic_form_error
from frontend import ajaxform


def gleaned_data_required(f):
    @wraps(f)
    def wrapper(request):
        try:
            d = request.session['data_capture']['gleaned_data']
        except:
            return redirect('data_capture:step_3')

        return f(request, registry.deserialize(d))
    return wrapper


@login_required
def step_1(request):
    if request.method == 'GET':
        form = forms.Step1Form()
    elif request.method == 'POST':
        form = forms.Step1Form(request.POST)
        if form.is_valid():
            # Clear out request.session if it previously existed
            if 'data_capture' in request.session:
                del request.session['data_capture']

            request.session['data_capture'] = {
                'contract_number': request.POST['contract_number'],
                'vendor_name': request.POST['vendor_name'],
                'schedule': request.POST['schedule']
            }

            return redirect('data_capture:step_2')

        else:
            add_generic_form_error(request, form)

    return render(request, 'data_capture/price_list/step_1.html', {
            'step_number': 1,
            'form': form,
        })


@login_required
def step_2(request):
    # Redirect back to step 1 if we don't have data
    if 'contract_number' not in request.session['data_capture']:
        return redirect('data_capture:step_1')

    if request.method == 'GET':
        form = forms.Step2Form()
    elif request.method == 'POST':
        form = forms.Step2Form(request.POST)
        if form.is_valid():
            price_list = form.save(commit=False)
            price_list.schedule = request.session['data_capture']['schedule']
            price_list.contract_number = \
                request.session['data_capture']['contract_number']
            price_list.vendor_name = \
                request.session['data_capture']['vendor_name']
            price_list.submitter = request.user
            price_list.save()
            request.session['price_list_id'] = price_list.id

            return redirect('data_capture:step_3')
        else:
            add_generic_form_error(request, form)

    return render(request, 'data_capture/price_list/step_2.html', {
        'step_number': 2,
        'form': form
    })


@login_required
def step_3(request):
    if request.method == 'GET':
        form = forms.Step3Form()
    elif request.method == 'POST':
        posted_data = dict(
                request.POST,
                schedule=request.session['data_capture']['schedule'])
        form = forms.Step3Form(posted_data, request.FILES)

        if form.is_valid():
            request.session['data_capture']['gleaned_data'] = \
                registry.serialize(form.cleaned_data['gleaned_data'])

            # Changing the value of a subkey doesn't cause the session to save,
            # so do it manually
            request.session.modified = True

            return ajaxform.redirect(request, 'data_capture:step_4')
        else:
            add_generic_form_error(request, form)

    return ajaxform.render(
        request,
        context={
            'step_number': 3,
            'form': form
        },
        template_name='data_capture/price_list/step_3.html',
        ajax_template_name='data_capture/upload_form.html',
    )


@login_required
@gleaned_data_required
def step_4(request, gleaned_data):
    if request.method == 'GET':
        preferred_schedule = registry.get_class(
            request.session['data_capture']['schedule']
        )
    elif request.method == 'POST':
        if gleaned_data.valid_rows:
            current_price_list = \
                SubmittedPriceList.objects.get(id=request.session['price_list_id'])
            current_price_list.serialized_gleaned_data = json.dumps(
                request.session['data_capture']['gleaned_data'])
            current_price_list.save()
            gleaned_data.add_to_price_list(current_price_list)
        else:
            add_generic_form_error(request, form)

    return render(request, 'data_capture/price_list/step_4.html', {
        'step_number': 4,
        'gleaned_data': gleaned_data,
        'is_preferred_schedule': isinstance(gleaned_data, preferred_schedule),
        'preferred_schedule': preferred_schedule,
    })


@login_required
@gleaned_data_required
def step_5(request, gleaned_data):
    if gleaned_data.valid_rows:
        del request.session['data_capture']
    else:
        # The user may have manually changed the URL or something to
        # get here. Push them back to the last step.
        return redirect('data_capture:step_4')

    return render(request, 'data_capture/price_list/step_5.html', {
        'step_number': 5
    })
