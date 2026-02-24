// Константы из Android‑версии
const TARGET_FAT_PERCENTAGE = 23.0;
const PEPPER_RATIO = 0.007;
const BEEF_RATIO = 0.005;
const SALT_SOLUTION_RATIO = 0.05;
const ERROR_THRESHOLD = 1e-6;
const WEIGHT_LOSS = 50.0;
const TARGET_MINCED_MEAT_WEIGHT = 3135.0; // Целевой вес фарша — 3135 г

function roundTo(value, decimalPlaces) {
    const factor = Math.pow(10, decimalPlaces);
    return Math.round(value * factor) / factor;
}

function calculateValues() {
    // Получаем значения из полей ввода
    const beefFat = parseFloat(document.getElementById('beefFat').value);
    const beefLean = parseFloat(document.getElementById('beefLean').value);
    const leanWeight = parseFloat(document.getElementById('leanWeight').value);

    // Очищаем область результатов
    const resultsDiv = document.getElementById('results');
    resultsDiv.innerHTML = '';

    // Валидация
    if (!beefFat || !beefLean || !leanWeight) {
        showError('Ошибка: заполните все поля');
        return;
    }

    if (beefFat < 0 || beefFat > 100 || beefLean < 0 || beefLean > 100) {
        showError('Ошибка: жирность должна быть в диапазоне 0–100 %');
        return;
    }

    if (leanWeight <= 100) {
        showError('Ошибка: масса мякоти должна быть больше 100 г');
        return;
    }

    // Проверка на деление на ноль
    if (Math.abs(beefFat - TARGET_FAT_PERCENTAGE) < ERROR_THRESHOLD) {
        showError('Ошибка: значение жирности жира не может быть 23 % (приводит к делению на ноль)');
        return;
    }

    // Расчёт коэффициента
    const coeff = (TARGET_FAT_PERCENTAGE - beefLean) / (beefFat - TARGET_FAT_PERCENTAGE);

    // Проверка диапазона коэффициента
    if (coeff < 0) {
        showError('Ошибка: расчёт невозможен — коэффициент < 0. Проверьте входные данные');
        return;
    } else if (coeff > 10) {
        showError('Ошибка: расчёт невозможен — коэффициент > 10. Проверьте входные данные');
        return;
    }

    // Основные расчёты
    const addedFat = (leanWeight - 100) * coeff;
    const ov = (leanWeight - 100) + addedFat;
    const pepper = ov * PEPPER_RATIO;
    const beef = ov * BEEF_RATIO;
    const saltSolution = ov * SALT_SOLUTION_RATIO;

    // Ожидаемый вес фарша с потерей 50 г
    const expectedMincedMeatWeight = (ov + pepper + beef + saltSolution) - WEIGHT_LOSS;

    // Масштабирование для целевого веса
    const scaleFactor = TARGET_MINCED_MEAT_WEIGHT / expectedMincedMeatWeight;

    const scaledLeanWeight = leanWeight * scaleFactor;
    const scaledAddedFat = addedFat * scaleFactor;
    const scaledOv = ov * scaleFactor;
    const scaledPepper = pepper * scaleFactor;
    const scaledBeef = beef * scaleFactor;
    const scaledSaltSolution = saltSolution * scaleFactor;

    // Вывод результатов
showResult(`Коэффициент = ${roundTo(coeff, 3)}`);
showResult(`Добавленный жир = ${roundTo(addedFat, 1)} г`);
showResult(`Масса жира и мякоти = ${roundTo(ov, 1)} г`);
showResult(`Перец = ${roundTo(pepper, 1)} г`);
showResult(`Говядина = ${roundTo(beef, 1)} г`);
showResult(`Солевой раствор = ${roundTo(saltSolution, 1)} г`);
showResult(`Ожидаемая масса готового фарша = ${roundTo(expectedMincedMeatWeight, 1)} г`);

showResult('');
showResult('--- РАСЧЁТ ДЛЯ ${TARGET_MINCED_MEAT_WEIGHT} г ГОТОВОГО ФАРША ---');
showResult(`Коэффициент масштабирования: ${roundTo(scaleFactor, 3)}`);
showResult(`Мясо (постное): ${roundTo(scaledLeanWeight, 1)} г`);
showResult(`Добавленный жир: ${roundTo(scaledAddedFat, 1)} г`);
showResult(`Масса жира и мякоти: ${roundTo(scaledOv, 1)} г`);
showResult(`Перец: ${roundTo(scaledPepper, 1)} г`);
showResult(`Говядина: ${roundTo(scaledBeef, 1)} г`);
showResult(`Солевой раствор: ${roundTo(scaledSaltSolution, 1)} г`);
}

function showResult(text) {
    const resultsDiv = document.getElementById('results');
    const resultItem = document.createElement('div');
    resultItem.className = 'result-item';
    resultItem.textContent = text;
    resultsDiv.appendChild(resultItem);
}

function showError(message) {
    const resultsDiv = document.getElementById('results');
    resultsDiv.innerHTML = `<div class="result-item error">${message}</div>`;
}

// Обработчик нажатия кнопки
document.getElementById('calculateBtn').addEventListener('click', calculateValues);

// Также добавляем обработку нажатия Enter в любом поле ввода
document.querySelectorAll('input').forEach(input => {
    input.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            calculateValues();
        }
    });
});
