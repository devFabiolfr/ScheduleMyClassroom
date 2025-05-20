document.addEventListener('DOMContentLoaded', function() {
    // Dados dos horários
    const timeSlots = [
        '13:20-14:10',
        '14:10-15:00',
        '15:10-16:00',
        '16:00-16:50',
        '16:50-17:40',
        '17:40-18:30',
        '18:45-19:35',
        '19:35-20:25',
        '20:35-21:25',
        '21:25-22:15'
    ];

    const days = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
    const tableBody = document.querySelector('#scheduleTable tbody');
    let scheduleData = {};

    // Inicializa os dados
    function initializeData() {
        timeSlots.forEach(time => {
            scheduleData[time] = {};
            days.forEach(day => {
                scheduleData[time][day] = false; // false = disponível (verde)
            });
        });
        loadSavedData();
    }

    // Carrega dados salvos do localStorage
    function loadSavedData() {
        const savedData = localStorage.getItem('professorSchedule');
        if (savedData) {
            scheduleData = JSON.parse(savedData);
        }
        renderTable();
    }

    // Renderiza a tabela
    function renderTable() {
        tableBody.innerHTML = '';
        
        timeSlots.forEach(time => {
            const row = document.createElement('tr');
            
            // Célula do horário
            const timeCell = document.createElement('td');
            timeCell.textContent = time;
            row.appendChild(timeCell);
            
            // Células dos dias
            days.forEach(day => {
                const cell = document.createElement('td');
                cell.dataset.time = time;
                cell.dataset.day = day;
                
                if (scheduleData[time][day]) {
                    cell.classList.add('unavailable');
                } else {
                    cell.classList.add('available');
                }
                
                cell.addEventListener('click', toggleAvailability);
                row.appendChild(cell);
            });
            
            tableBody.appendChild(row);
        });
    }

    // Alterna disponibilidade do horário
    function toggleAvailability(e) {
        const cell = e.target;
        const time = cell.dataset.time;
        const day = cell.dataset.day;
        
        scheduleData[time][day] = !scheduleData[time][day];
        
        if (scheduleData[time][day]) {
            cell.classList.remove('available');
            cell.classList.add('unavailable');
        } else {
            cell.classList.remove('unavailable');
            cell.classList.add('available');
        }
    }

    // Salva os dados no localStorage
    function saveData() {
        localStorage.setItem('professorSchedule', JSON.stringify(scheduleData));
        alert('Planejamento salvo com sucesso!');
    }

    // Limpa todos os dados
    function clearData() {
        if (confirm('Tem certeza que deseja limpar todo o planejamento?')) {
            initializeData();
            localStorage.removeItem('professorSchedule');
            renderTable();
        }
    }

    // Event listeners
    document.getElementById('saveBtn').addEventListener('click', saveData);
    document.getElementById('clearBtn').addEventListener('click', clearData);

    // Inicializa o aplicativo
    initializeData();
});