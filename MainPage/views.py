from django.shortcuts import render

import json
import math

from django.http import JsonResponse
from django.views.decorators.http import require_POST
from .decorators import require_calculation_data

from . import services


data_methods = {
    "m1_1": services.data1,
    "m1_2": services.data2,
}
predict_returns_methods = {
    "m2_1": services.predict_returns1,
    "m2_2": services.predict_returns2,
}
matrix_methods = {
    "m3_1": services.simple_covarience,
    "m3_2": services.calculate_covariance2,
}
portfolio_methods = {
    "m4_1": services.critical_line_algorithm,
    "m4_2": services.optimize_portfolio2,
}
risk_methods = {
    "m5_1": services.evaluate_risk1,
    "m5_2": services.evaluate_risk2,
}

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
@require_calculation_data
def calculate(request):
    data = request.calculation_data
    methods = data["methods"]
    tickers = data["tickers"]

    method_groups = [
        data_methods,
        predict_returns_methods,
        matrix_methods,
        portfolio_methods,
        risk_methods,
    ]

    if len(methods) != len(method_groups):
        return JsonResponse(
            {"error": "Нужно выбрать метод для каждого из пяти модулей"},
            status=400,
        )

    # Сначала проверяем весь выбор, затем запускаем расчёты.
    selected = {}

    for item in methods:
        if not isinstance(item, dict):
            return JsonResponse(
                {"error": "Каждый выбранный метод должен быть объектом"},
                status=400,
            )

        module_id = item.get("module_id")
        method_id = item.get("method_id")

        if type(module_id) is not int or not 1 <= module_id <= 5:
            return JsonResponse(
                {"error": "Некорректный номер модуля"},
                status=400,
            )

        if module_id in selected:
            return JsonResponse(
                {"error": f"Модуль {module_id} указан несколько раз"},
                status=400,
            )

        # Например: {"m1_1": services.data1, "m1_2": services.data2}
        available_methods = method_groups[module_id - 1]

        if not isinstance(method_id, str) or method_id not in available_methods:
            return JsonResponse(
                {"error": f"Недоступный метод для модуля {module_id}"},
                status=400,
            )

        selected[module_id] = available_methods[method_id]

    prices = selected[1](tickers)
    expected_returns = selected[2](prices)
    covariance_matrix = selected[3](prices)
    portfolio_weights = selected[4](expected_returns, covariance_matrix)
    risk = selected[5](prices, portfolio_weights)

    return JsonResponse({
        "portfolio_weights": portfolio_weights,
        "covariance_matrix": covariance_matrix,
        "expected_returns": expected_returns,
        "risk": risk,
    })