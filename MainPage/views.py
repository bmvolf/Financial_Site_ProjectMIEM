from django.shortcuts import render
from django.http import HttpResponse

  
def index(request):
    return render(
        request,
        "index.html",
        {"active_page": "index"},
    )

def contact(request):
    return render(request, "contact.html", {
        "active_page": "contact",
        "page_heading": "Команда проекта и контакты",
    })

def dashboard(request):
    return render(request, "dashboard.html", {
        "active_page": "dashboard",
        "page_heading": "Дашборды оптимизации портфеля",
    })