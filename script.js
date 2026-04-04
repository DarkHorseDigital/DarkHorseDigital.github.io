if ('serviceWorker' in navigator) {
  window.addEventListener('load', function() {
    navigator.serviceWorker.register('/sw.js')
      .then(function(registration) {
        console.log('ServiceWorker зарегистрирован: ', registration);

        navigator.serviceWorker.ready.then(registration => {
  registration.update();
});
        
      })
      .catch(function(error) {
        console.log('Ошибка регистрации ServiceWorker: ', error);
      });
  });
}

// Константы из Android‑версии
const TARGET_FAT_PERCENTAGE = 23.0;
const PEPPER_RATIO = 0.007;
const BEEF_RATIO = 0.005;
const SALT_SOLUTION_RATIO = 0.05;
const ERROR_THRESHOLD = 1e-6;
const WEIGHT_LOSS = 50.0;

function roundTo(value, decimalPlaces) {
  const factor = Math.pow(10, decimalPlaces);
  return Math.round(value * factor) / factor;
}

function calculateValues() {
  // Получаем значения из полей ввода
  const saltInFat = parseFloat(document.getElementById('saltInFat').value); // Новое поле
  const beefFat = parseFloat(document.getElementById('beefFat').value);
  const beefLean = parseFloat(document.getElementById('beefLean').value);
  const leanWeight = parseFloat(document.getElementById('leanWeight').value);

  // Очищаем область результатов
  const resultsDiv = document.getElementById('results');
  resultsDiv.innerHTML = '';

  // Валидация
  if (!beefFat || !beefLean || !leanWeight || isNaN(saltInFat)) {
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

  if (saltInFat < 0) {
    showError('Ошибка: соль в жире должна быть не меньше 0 %');
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

  // Расчёт количества соли на 750 г воды (линейный)
  let saltQuantity;
  const n = saltInFat;

  if (n > 2.55) {
    // Обработка значений больше 2.55
    const estimatedSalt = Math.max(85 - (n - 2.55) * 10, 0);

    showError('Содержание соли в жире слишком высокое!');
    showResult(`<span style="color: gray;">Предполагаемое кол-во соли на 750 г воды: ${roundTo(estimatedSalt, 1)} г</span>`);
    return;
  } else if (n >= 0.00 && n <= 2.55) {
    // Линейная интерполяция
    saltQuantity = 105 - (n / 2.55) * 20;
    saltQuantity = roundTo(saltQuantity, 1);
  }

  // Вывод результатов
  showResult(`Добавленный жир = ${roundTo(addedFat, 1)} г`);
  showResult(`Кол-во соли на 750 г воды = ${saltQuantity} г`);
  showResult(`Солевой раствор = ${roundTo(saltSolution, 1)} г`);
  showResult(`Перец = ${roundTo(pepper, 1)} г`);
  showResult(`Говядина = ${roundTo(beef, 1)} г`);
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

