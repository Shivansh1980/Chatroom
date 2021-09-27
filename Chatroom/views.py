from django import views
from django.http import HttpResponse
from django.shortcuts import render
from rest_framework.response import Response

def show_frontend(request):
    return render(request, 'index.html')

def delete_session(request):
    try:
        if request.session and len(request.session.keys()) != 0:
            for key in request.session.keys():
                del request.session[key]
    except Exception as e:
        return Response({'status':False, 'error':str(e)})
    return Response({'status':True,'message':'Session Cleared Successfully'})
            