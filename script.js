document.addEventListener('DOMContentLoaded', function() {
    // Referências aos elementos do DOM
    const celsiusInput = document.getElementById('celsiusInput');
    const resultadoSpan = document.getElementById('resultado');
    const historyList = document.getElementById('historyList');
    const keypadButtons = document.querySelectorAll('.keypad-btn');
    
    // Botões de conversão e limpeza
    const converterFahrenheitBtn = document.getElementById('converterFahrenheitBtn');
    const converterCelsiusBtn = document.getElementById('converterCelsiusBtn');
    const converterKelvinBtn = document.getElementById('converterKelvinBtn');
    const clearHistoryBtn = document.getElementById('clearHistoryBtn');

    // --- FUNÇÕES DE LÓGICA DO APLICATIVO ---

    // Função para validar a entrada de dados (NOVA)
    function validateInput(value, unit) {
        if (isNaN(value) || celsiusInput.value.trim() === '') {
            return "Por favor, digite um número válido!";
        }
        if (unit === 'C' && value < -273.15) {
            return "A temperatura não pode ser menor que o zero absoluto (-273.15°C)!";
        }
        if (unit === 'F' && value < -459.67) {
            return "A temperatura não pode ser menor que o zero absoluto (-459.67°F)!";
        }
        return null; // Retorna nulo se a validação for bem-sucedida
    }

    // Função para renderizar o histórico na página a partir do localStorage
    function renderHistory() {
        historyList.innerHTML = '';
        const history = JSON.parse(localStorage.getItem('tempHistory')) || [];
        // Inverte o array para mostrar os itens mais recentes no topo
        history.forEach(item => {
            const newEntry = document.createElement('li');
            newEntry.innerHTML = `${item.inputTemp}°${item.inputUnit} = **${item.outputTemp}°${item.outputUnit}**`;
            historyList.appendChild(newEntry);
        });
    }

    // Função para adicionar um item ao histórico e salvá-lo no localStorage
    function addToHistory(inputTemp, inputUnit, outputTemp, outputUnit) {
        const history = JSON.parse(localStorage.getItem('tempHistory')) || [];
        history.unshift({
            inputTemp: inputTemp,
            inputUnit: inputUnit,
            outputTemp: outputTemp,
            outputUnit: outputUnit
        });
        localStorage.setItem('tempHistory', JSON.stringify(history));
        renderHistory();
    }

    // Função para limpar o histórico do localStorage e da página
    function clearHistory() {
        localStorage.removeItem('tempHistory');
        renderHistory();
    }
    
    // --- FUNÇÕES DE CONVERSÃO PRINCIPAIS ---

    function convertToFahrenheit() {
        const celsius = parseFloat(celsiusInput.value);
        const errorMessage = validateInput(celsius, 'C');
        
        if (errorMessage) {
            resultadoSpan.textContent = errorMessage;
            resultadoSpan.style.color = "#dc3545";
            return;
        }

        const fahrenheit = (celsius * 9/5) + 32;
        const fahrenheitRounded = fahrenheit.toFixed(2);
        resultadoSpan.textContent = `${fahrenheitRounded}°F`;
        resultadoSpan.style.color = "#28a745";
        addToHistory(celsius, 'C', fahrenheitRounded, 'F');
        
        celsiusInput.value = '';
    }

    function convertToCelsius() {
        const fahrenheit = parseFloat(celsiusInput.value);
        const errorMessage = validateInput(fahrenheit, 'F');

        if (errorMessage) {
            resultadoSpan.textContent = errorMessage;
            resultadoSpan.style.color = "#dc3545";
            return;
        }

        const celsius = (fahrenheit - 32) * 5/9;
        const celsiusRounded = celsius.toFixed(2);
        resultadoSpan.textContent = `${celsiusRounded}°C`;
        resultadoSpan.style.color = "#28a745";
        addToHistory(fahrenheit, 'F', celsiusRounded, 'C');
        
        celsiusInput.value = '';
    }
    
    function convertToKelvin() {
        const celsius = parseFloat(celsiusInput.value);
        const errorMessage = validateInput(celsius, 'C');

        if (errorMessage) {
            resultadoSpan.textContent = errorMessage;
            resultadoSpan.style.color = "#dc3545";
            return;
        }

        const kelvin = celsius + 273.15;
        const kelvinRounded = kelvin.toFixed(2);
        resultadoSpan.textContent = `${kelvinRounded}°K`;
        resultadoSpan.style.color = "#28a745";
        addToHistory(celsius, 'C', kelvinRounded, 'K');
        
        celsiusInput.value = '';
    }

    // --- MANEJO DE EVENTOS ---
    
    // Lógica para os botões do teclado numérico
    keypadButtons.forEach(button => {
        button.addEventListener('click', () => {
            const buttonValue = button.textContent;
            
            if (button.classList.contains('clear')) {
                celsiusInput.value = '';
            } else if (button.classList.contains('dot')) {
                if (!celsiusInput.value.includes('.')) {
                    celsiusInput.value += buttonValue;
                }
            } else {
                celsiusInput.value += buttonValue;
            }
        });
    });

    // Lógica para o teclado do computador (e celular)
    document.addEventListener('keydown', function(event) {
        const key = event.key;
        
        // Se o foco está no input e a tecla pressionada é para digitação (um único caractere), prevenimos.
        if (event.target === celsiusInput && key.length === 1 && !event.ctrlKey) {
            // Isso previne que o usuário digite letras, números ou símbolos diretamente.
            // O código abaixo controla quais teclas são permitidas para atalho.
            event.preventDefault(); 
        }

        // Permitir a função de Backspace
        if (key === 'Backspace') {
            celsiusInput.value = celsiusInput.value.slice(0, -1);
        }
        
        // Atribui 'F' ou 'Enter' à conversão de Celsius para Fahrenheit
        else if (key.toLowerCase() === 'f' || key === 'Enter') {
            event.preventDefault();
            convertToFahrenheit();
        }
        // Atribui 'K' à conversão de Celsius para Kelvin
        else if (key.toLowerCase() === 'k') {
            event.preventDefault();
            convertToKelvin();
        }
        // Atribui 'C' à conversão de Fahrenheit para Celsius
        else if (key.toLowerCase() === 'c') {
            event.preventDefault();
            convertToCelsius();
        }
        // Permite a digitação de números e ponto (opcional, se você quiser permitir o teclado físico)
        else if (event.target === celsiusInput && (/[0-9]/.test(key) || key === '.' || key === ',')) {
            if (key === ',') key = '.'; // Normaliza a vírgula para ponto
            if (key === '.' && celsiusInput.value.includes('.')) return; // Evita dois pontos
            celsiusInput.value += key;
        }
    });
    
    // Eventos de clique para os botões de conversão e limpeza
    converterFahrenheitBtn.addEventListener('click', convertToFahrenheit);
    converterCelsiusBtn.addEventListener('click', convertToCelsius);
    converterKelvinBtn.addEventListener('click', convertToKelvin);
    clearHistoryBtn.addEventListener('click', clearHistory);

    // Carrega o histórico ao iniciar a página
    renderHistory();
});