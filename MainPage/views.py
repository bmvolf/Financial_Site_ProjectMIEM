from django.shortcuts import render

import json
import math

from django.http import JsonResponse
from django.views.decorators.http import require_POST


def index(request):
    return render(request, "index.html", {
        "active_page": "index",
    })


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


@require_POST
def calculate(request):
    # Читаем JSON из тела запроса.
    try:
        data = json.loads(request.body)
    except (ValueError, UnicodeDecodeError):
        return JsonResponse(
            {"error": "Некорректный JSON"},
            status=400,
        )

    if not isinstance(data, dict):
        return JsonResponse(
            {"error": "Ожидается JSON-объект"},
            status=400,
        )

    methods = data.get("methods")
    tickers = data.get("tickers")

    return JsonResponse({
    "message": "Все дошло!",
    "methods": methods,
    "tickers": tickers,
})