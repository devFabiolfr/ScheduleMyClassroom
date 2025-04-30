document.addEventListener('DOMContentLoaded', function() {
    // Elementos do DOM
    const calendarView = document.getElementById('calendarView');
    const currentPeriod = document.getElementById('currentPeriod');
    const prevPeriodBtn = document.getElementById('prevPeriod');
    const nextPeriodBtn = document.getElementById('nextPeriod');
    const semesterSelect = document.getElementById('semesterSelect');
    const disciplineSelect = document.getElementById('disciplineSelect');
    const viewTypeSelect = document.getElementById('viewType');
    const classModal = new bootstrap.Modal(document.getElementById('classModal'));
    const summaryModal = new bootstrap.Modal(document.getElementById('summaryModal'));
    const classForm = document.getElementById('classForm');
    const saveClassBtn = document.getElementById('saveClassBtn');
    const deleteClassBtn = document.getElementById('deleteClassBtn');
    const classDisciplineSelect = document.getElementById('classDiscipline');
    const classSemesterSelect = document.getElementById('classSemester');
    const classDateInput = document.getElementById('classDate');
    const classStartTimeInput = document.getElementById('classStartTime');
    const classEndTimeInput = document.getElementById('classEndTime');
    const classWorkloadInput = document.getElementById('classWorkload');
    const classTypeSelect = document.getElementById('classType');
    const classTopicInput = document.getElementById('classTopic');
    const classObservationsInput = document.getElementById('classObservations');
    const classRecurringCheckbox = document.getElementById('classRecurring');
    const recurringOptionsDiv = document.getElementById('recurringOptions');
    const exportSummaryBtn = document.getElementById('exportSummaryBtn');
    const workloadChartDiv = document.getElementById('workloadChart');
    const classDistributionChartDiv = document.getElementById('classDistributionChart');
    const disciplineDetailsDiv = document.getElementById('disciplineDetails');

    // Estado da aplicação
    let currentDate = new Date();
    let currentView = 'month';
    let classes = JSON.parse(localStorage.getItem('academicClasses')) || [];
    let disciplines = JSON.parse(localStorage.getItem('teacherDisciplines')) || [];
    let selectedClass = null;
    let workloadChart = null;
    let distributionChart = null;

    // Inicializar disciplinas padrão se não existirem
    if (disciplines.length === 0) {
        disciplines = [
            { id: '1', name: 'Algoritmos e Programação', code: 'CC101', workload: 60, semester: '2023.2' },
            { id: '2', name: 'Banco de Dados', code: 'CC202', workload: 60, semester: '2023.2' },
            { id: '3', name: 'Engenharia de Software', code: 'CC303', workload: 45, semester: '2023.2' }
        ];
        localStorage.setItem('teacherDisciplines', JSON.stringify(disciplines));
    }

    // Inicializar a aplicação
    initApplication();

    // Event Listeners
    prevPeriodBtn.addEventListener('click', () => navigatePeriod(-1));
    nextPeriodBtn.addEventListener('click', () => navigatePeriod(1));
    semesterSelect.addEventListener('change', () => {
        populateDisciplineSelects();
        renderCalendar();
    });
    disciplineSelect.addEventListener('change', renderCalendar);
    viewTypeSelect.addEventListener('change', changeViewType);
    saveClassBtn.addEventListener('click', saveClass);
    deleteClassBtn.addEventListener('click', deleteClass);
    classRecurringCheckbox.addEventListener('change', toggleRecurringOptions);
    exportSummaryBtn.addEventListener('click', exportSummary);
    summaryModal._element.addEventListener('shown.bs.modal', renderSummaryCharts);

    // Inicializar a aplicação
    function initApplication() {
        populateDisciplineSelects();
        renderCalendar();
        classDateInput.min = new Date().toISOString().split('T')[0];
    }

    // Popular os selects de disciplina
    function populateDisciplineSelects() {
        // Limpar selects
        disciplineSelect.innerHTML = '<option value="all">Todas as Disciplinas</option>';
        classDisciplineSelect.innerHTML = '';

        const currentSemester = semesterSelect.value;

        // Filtrar disciplinas do semestre atual e popular selects
        disciplines
            .filter(d => d.semester === currentSemester)
            .forEach(discipline => {
                const optionText = `${discipline.code} - ${discipline.name}`;
                
                // Para o filtro
                const option1 = document.createElement('option');
                option1.value = discipline.id;
                option1.textContent = optionText;
                disciplineSelect.appendChild(option1);
                
                // Para o formulário
                const option2 = document.createElement('option');
                option2.value = discipline.id;
                option2.textContent = optionText;
                classDisciplineSelect.appendChild(option2);
            });
    }

    // Renderizar o calendário
    function renderCalendar() {
        calendarView.innerHTML = '';
        
        if (currentView === 'month') {
            renderMonthView();
        } else {
            renderWeekView();
        }
    }

    // Renderizar visualização mensal
    function renderMonthView() {
        currentView = 'month';
        currentPeriod.textContent = `${getMonthName(currentDate.getMonth())} ${currentDate.getFullYear()}`;

        const monthView = document.createElement('div');
        monthView.className = 'month-view';

        // Cabeçalho dos dias da semana
        const weekdays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
        weekdays.forEach(day => {
            const dayHeader = document.createElement('div');
            dayHeader.className = 'month-header-day';
            dayHeader.textContent = day;
            monthView.appendChild(dayHeader);
        });

        const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
        const lastDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
        const startingDayOfWeek = firstDayOfMonth.getDay();
        const totalDays = lastDayOfMonth.getDate();

        // Dias vazios no início
        for (let i = 0; i < startingDayOfWeek; i++) {
            const emptyDay = document.createElement('div');
            emptyDay.classList.add('month-day', 'empty');
            monthView.appendChild(emptyDay);
        }

        // Dias do mês
        const today = new Date();
        const currentSemester = semesterSelect.value;
        const selectedDiscipline = disciplineSelect.value;

        for (let day = 1; day <= totalDays; day++) {
            const dayElement = document.createElement('div');
            dayElement.classList.add('month-day');
            
            if (currentDate.getFullYear() === today.getFullYear() && 
                currentDate.getMonth() === today.getMonth() && 
                day === today.getDate()) {
                dayElement.classList.add('today');
            }

            // Número do dia
            const dayNumber = document.createElement('div');
            dayNumber.classList.add('month-day-number');
            dayNumber.textContent = day;
            dayElement.appendChild(dayNumber);

            // Aulas do dia
            const dateKey = formatDateKey(new Date(currentDate.getFullYear(), currentDate.getMonth(), day));
            
            let dayClasses = classes.filter(cls => {
                const sameDate = cls.date === dateKey;
                const sameSemester = cls.semester === currentSemester;
                const sameDiscipline = selectedDiscipline === 'all' || cls.disciplineId === selectedDiscipline;
                return sameDate && sameSemester && sameDiscipline;
            });

            // Ordenar por horário
            dayClasses.sort((a, b) => a.startTime.localeCompare(b.startTime));

            dayClasses.forEach(cls => {
                const discipline = disciplines.find(d => d.id === cls.disciplineId);
                const classElement = document.createElement('div');
                classElement.classList.add('class-event', getClassTypeClass(cls.type));
                
                const startTime = cls.startTime.substring(0, 5);
                const endTime = cls.endTime.substring(0, 5);
                
                classElement.textContent = `${startTime} ${discipline.code}: ${cls.topic || 'Aula'}`;
                classElement.title = `${discipline.name}\n${startTime} - ${endTime}\n${cls.topic || 'Sem descrição'}`;
                classElement.dataset.classId = cls.id;
                
                classElement.addEventListener('click', (e) => {
                    e.stopPropagation();
                    openEditClassModal(cls);
                });
                
                dayElement.appendChild(classElement);
            });

            // Adicionar nova aula
            dayElement.addEventListener('click', () => {
                selectedClass = null;
                const selectedDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
                openNewClassModal(selectedDate);
            });

            monthView.appendChild(dayElement);
        }

        calendarView.appendChild(monthView);
    }

    // Renderizar visualização semanal
    function renderWeekView() {
        currentView = 'week';
        
        const weekStart = new Date(currentDate);
        weekStart.setDate(currentDate.getDate() - currentDate.getDay());
        
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 6);
        
        currentPeriod.textContent = `Semana de ${formatDate(weekStart)} a ${formatDate(weekEnd)}`;
        calendarView.innerHTML = '';

        const weekView = document.createElement('div');
        weekView.className = 'week-view';

        // Cabeçalho da semana
        const weekHeader = document.createElement('div');
        weekHeader.className = 'week-header';
        weekHeader.appendChild(document.createElement('div'));

        // Dias da semana
        for (let i = 0; i < 7; i++) {
            const day = new Date(weekStart);
            day.setDate(weekStart.getDate() + i);
            
            const dayHeader = document.createElement('div');
            dayHeader.className = 'week-day-header';
            
            const dayName = getWeekdayName(day.getDay());
            const dayNumber = day.getDate();
            dayHeader.innerHTML = `${dayName}<br>${dayNumber}`;
            
            const today = new Date();
            if (day.getDate() === today.getDate() && 
                day.getMonth() === today.getMonth() && 
                day.getFullYear() === today.getFullYear()) {
                dayHeader.style.fontWeight = 'bold';
                dayHeader.style.color = '#0d6efd';
            }
            
            weekHeader.appendChild(dayHeader);
        }
        
        weekView.appendChild(weekHeader);

        // Slots de horário (8h às 22h)
        const timeSlots = document.createElement('div');
        timeSlots.className = 'week-time-slots';

        const currentSemester = semesterSelect.value;
        const selectedDiscipline = disciplineSelect.value;

        for (let hour = 8; hour <= 22; hour++) {
            for (let minute = 0; minute < 60; minute += 30) {
                const timeSlot = document.createElement('div');
                timeSlot.className = 'time-slot';
                
                // Label de horário
                if (minute === 0) {
                    const timeLabel = document.createElement('div');
                    timeLabel.className = 'time-label';
                    timeLabel.textContent = `${hour.toString().padStart(2, '0')}:00`;
                    timeSlot.appendChild(timeLabel);
                }
                
                // Dias da semana
                for (let i = 0; i < 7; i++) {
                    const day = new Date(weekStart);
                    day.setDate(weekStart.getDate() + i);
                    
                    const dayCell = document.createElement('div');
                    dayCell.className = 'week-day';
                    
                    const today = new Date();
                    if (day.getDate() === today.getDate() && 
                        day.getMonth() === today.getMonth() && 
                        day.getFullYear() === today.getFullYear()) {
                        dayCell.classList.add('today');
                    }
                    
                    // Verificar aulas neste horário
                    const dateKey = formatDateKey(day);
                    const timeKey = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
                    
                    let dayClasses = classes.filter(cls => {
                        const sameDate = cls.date === dateKey;
                        const sameTime = cls.startTime === timeKey;
                        const sameSemester = cls.semester === currentSemester;
                        const sameDiscipline = selectedDiscipline === 'all' || cls.disciplineId === selectedDiscipline;
                        return sameDate && sameTime && sameSemester && sameDiscipline;
                    });
                    
                    dayClasses.forEach(cls => {
                        const discipline = disciplines.find(d => d.id === cls.disciplineId);
                        const classElement = document.createElement('div');
                        classElement.classList.add('class-event', getClassTypeClass(cls.type));
                        
                        const endTime = cls.endTime.substring(0, 5);
                        classElement.textContent = `${discipline.code} (${endTime})`;
                        classElement.title = `${discipline.name}\n${cls.startTime.substring(0, 5)} - ${endTime}\n${cls.topic || 'Sem descrição'}`;
                        classElement.dataset.classId = cls.id;
                        
                        classElement.addEventListener('click', (e) => {
                            e.stopPropagation();
                            openEditClassModal(cls);
                        });
                        
                        dayCell.appendChild(classElement);
                    });
                    
                    // Adicionar nova aula
                    dayCell.addEventListener('click', () => {
                        selectedClass = null;
                        const selectedDate = new Date(day);
                        selectedDate.setHours(hour, minute, 0, 0);
                        openNewClassModal(selectedDate);
                    });
                    
                    timeSlot.appendChild(dayCell);
                }
                
                timeSlots.appendChild(timeSlot);
            }
        }
        
        weekView.appendChild(timeSlots);
        calendarView.appendChild(weekView);
    }

    // Navegar entre períodos
    function navigatePeriod(direction) {
        if (currentView === 'month') {
            currentDate.setMonth(currentDate.getMonth() + direction);
        } else {
            currentDate.setDate(currentDate.getDate() + (direction * 7));
        }
        renderCalendar();
    }

    // Mudar tipo de visualização
    function changeViewType() {
        currentView = viewTypeSelect.value;
        renderCalendar();
    }

    // Abrir modal para nova aula
    function openNewClassModal(date) {
        selectedClass = null;
        classForm.reset();
        
        classDateInput.value = formatDateKey(date);
        classStartTimeInput.value = '08:00';
        classEndTimeInput.value = '09:00';
        classWorkloadInput.value = '1';
        classSemesterSelect.value = semesterSelect.value;
        
        deleteClassBtn.style.display = 'none';
        document.getElementById('modalTitle').textContent = 'Adicionar Aula';
        saveClassBtn.textContent = 'Salvar';
        
        classModal.show();
    }

    // Abrir modal para edição de aula
    function openEditClassModal(cls) {
        selectedClass = cls;
        
        classDisciplineSelect.value = cls.disciplineId;
        classSemesterSelect.value = cls.semester;
        classDateInput.value = cls.date;
        classStartTimeInput.value = cls.startTime;
        classEndTimeInput.value = cls.endTime;
        classWorkloadInput.value = cls.workload;
        classTypeSelect.value = cls.type;
        classTopicInput.value = cls.topic || '';
        classObservationsInput.value = cls.observations || '';
        
        if (cls.recurring) {
            classRecurringCheckbox.checked = true;
            recurringOptionsDiv.style.display = 'block';
            document.getElementById('recurringWeeks').value = cls.recurring.weeks || 4;
            
            document.querySelectorAll('.day-checkbox').forEach(checkbox => {
                checkbox.checked = cls.recurring.days.includes(parseInt(checkbox.value));
            });
        } else {
            classRecurringCheckbox.checked = false;
            recurringOptionsDiv.style.display = 'none';
        }
        
        deleteClassBtn.style.display = 'block';
        document.getElementById('modalTitle').textContent = 'Editar Aula';
        saveClassBtn.textContent = 'Atualizar';
        
        classModal.show();
    }

    // Mostrar/ocultar opções recorrentes
    function toggleRecurringOptions() {
        recurringOptionsDiv.style.display = classRecurringCheckbox.checked ? 'block' : 'none';
    }

    // Salvar aula (nova ou edição)
    function saveClass() {
        const discipline = disciplines.find(d => d.id === classDisciplineSelect.value);
        if (!discipline) {
            alert('Selecione uma disciplina válida.');
            return;
        }
        
        if (classStartTimeInput.value >= classEndTimeInput.value) {
            alert('O horário de término deve ser após o horário de início.');
            return;
        }
        
        if (classWorkloadInput.value <= 0) {
            alert('A carga horária deve ser maior que zero.');
            return;
        }
        
        const classData = {
            id: selectedClass ? selectedClass.id : generateId(),
            disciplineId: classDisciplineSelect.value,
            semester: classSemesterSelect.value,
            date: classDateInput.value,
            startTime: classStartTimeInput.value,
            endTime: classEndTimeInput.value,
            workload: parseInt(classWorkloadInput.value),
            type: classTypeSelect.value,
            topic: classTopicInput.value.trim(),
            observations: classObservationsInput.value.trim(),
            createdAt: selectedClass ? selectedClass.createdAt : new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        
        if (classRecurringCheckbox.checked) {
            const recurringDays = Array.from(document.querySelectorAll('.day-checkbox:checked'))
                .map(checkbox => parseInt(checkbox.value));
            
            if (recurringDays.length === 0) {
                alert('Selecione pelo menos um dia da semana para aulas recorrentes.');
                return;
            }
            
            const recurringWeeks = parseInt(document.getElementById('recurringWeeks').value) || 4;
            
            classData.recurring = {
                weeks: recurringWeeks,
                days: recurringDays
            };
            
            createRecurringClasses(classData);
        } else {
            if (selectedClass) {
                const index = classes.findIndex(c => c.id === selectedClass.id);
                if (index !== -1) {
                    classes[index] = classData;
                }
            } else {
                classes.push(classData);
            }
        }
        
        saveClassesToLocalStorage();
        renderCalendar();
        classModal.hide();
    }

    // Criar aulas recorrentes
    function createRecurringClasses(baseClass) {
        const baseDate = new Date(baseClass.date);
        const dayOfWeek = baseDate.getDay();
        const recurringDays = baseClass.recurring.days;
        const weeks = baseClass.recurring.weeks;
        const recurringGroupId = generateId();

        // Se estiver editando, remover aulas do mesmo grupo
        if (selectedClass && selectedClass.recurringGroupId) {
            classes = classes.filter(c => c.recurringGroupId !== selectedClass.recurringGroupId);
        }

        // Criar aulas para cada semana e dia selecionado
        for (let week = 0; week < weeks; week++) {
            recurringDays.forEach(day => {
                // Calcular data da aula
                const classDate = new Date(baseDate);
                classDate.setDate(baseDate.getDate() + (day - dayOfWeek) + (week * 7));
                
                // Verificar se a data é válida (não antes de hoje)
                if (classDate >= new Date(new Date().setHours(0, 0, 0, 0))) {
                    const classCopy = {...baseClass};
                    classCopy.id = generateId();
                    classCopy.date = formatDateKey(classDate);
                    classCopy.recurringGroupId = recurringGroupId;
                    classes.push(classCopy);
                }
            });
        }

        saveClassesToLocalStorage();
    }

    // Excluir aula
    function deleteClass() {
        if (selectedClass && confirm('Tem certeza que deseja excluir esta aula?')) {
            if (selectedClass.recurringGroupId) {
                // Excluir todas as aulas do grupo recorrente
                if (confirm('Esta é uma aula recorrente. Deseja excluir todas as aulas desta série?')) {
                    classes = classes.filter(c => c.recurringGroupId !== selectedClass.recurringGroupId);
                } else {
                    // Excluir apenas esta aula
                    classes = classes.filter(c => c.id !== selectedClass.id);
                }
            } else {
                // Excluir aula única
                classes = classes.filter(c => c.id !== selectedClass.id);
            }
            
            saveClassesToLocalStorage();
            renderCalendar();
            classModal.hide();
        }
    }

    // Renderizar gráficos do resumo semestral
    function renderSummaryCharts() {
        const currentSemester = semesterSelect.value;
        const semesterDisciplines = disciplines.filter(d => d.semester === currentSemester);
        const semesterClasses = classes.filter(c => c.semester === currentSemester);

        // Dados para gráfico de carga horária
        const workloadData = semesterDisciplines.map(discipline => {
            const disciplineClasses = semesterClasses.filter(c => c.disciplineId === discipline.id);
            const totalWorkload = disciplineClasses.reduce((sum, cls) => sum + cls.workload, 0);
            return {
                discipline: `${discipline.code} - ${discipline.name}`,
                planned: discipline.workload,
                completed: totalWorkload,
                remaining: Math.max(0, discipline.workload - totalWorkload)
            };
        });

        // Dados para gráfico de distribuição de aulas
        const classTypes = ['teorica', 'pratica', 'laboratorio', 'orientacao'];
        const typeNames = ['Teórica', 'Prática', 'Laboratório', 'Orientação'];
        const typeCounts = classTypes.map(type => 
            semesterClasses.filter(c => c.type === type).length
        );

        // Destruir gráficos existentes
        if (workloadChart) workloadChart.destroy();
        if (distributionChart) distributionChart.destroy();

        // Gráfico de carga horária (barra)
        const workloadCtx = document.createElement('canvas');
        workloadChartDiv.innerHTML = '';
        workloadChartDiv.appendChild(workloadCtx);
        
        workloadChart = new Chart(workloadCtx, {
            type: 'bar',
            data: {
                labels: workloadData.map(d => d.discipline),
                datasets: [
                    {
                        label: 'Carga Horária Planejada',
                        data: workloadData.map(d => d.planned),
                        backgroundColor: 'rgba(54, 162, 235, 0.5)',
                        borderColor: 'rgba(54, 162, 235, 1)',
                        borderWidth: 1
                    },
                    {
                        label: 'Carga Horária Ministrada',
                        data: workloadData.map(d => d.completed),
                        backgroundColor: 'rgba(75, 192, 192, 0.5)',
                        borderColor: 'rgba(75, 192, 192, 1)',
                        borderWidth: 1
                    },
                    {
                        label: 'Carga Horária Restante',
                        data: workloadData.map(d => d.remaining),
                        backgroundColor: 'rgba(255, 99, 132, 0.5)',
                        borderColor: 'rgba(255, 99, 132, 1)',
                        borderWidth: 1
                    }
                ]
            },
            options: {
                responsive: true,
                scales: {
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Horas'
                        }
                    }
                }
            }
        });

        // Gráfico de distribuição de tipos de aula (pizza)
        const distributionCtx = document.createElement('canvas');
        classDistributionChartDiv.innerHTML = '';
        classDistributionChartDiv.appendChild(distributionCtx);
        
        distributionChart = new Chart(distributionCtx, {
            type: 'pie',
            data: {
                labels: typeNames,
                datasets: [{
                    data: typeCounts,
                    backgroundColor: [
                        'rgba(13, 110, 253, 0.7)',
                        'rgba(25, 135, 84, 0.7)',
                        'rgba(111, 66, 193, 0.7)',
                        'rgba(253, 126, 20, 0.7)'
                    ],
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true
            }
        });

        // Detalhes das disciplinas
        disciplineDetailsDiv.innerHTML = '';
        semesterDisciplines.forEach(discipline => {
            const disciplineClasses = semesterClasses.filter(c => c.disciplineId === discipline.id);
            const totalWorkload = disciplineClasses.reduce((sum, cls) => sum + cls.workload, 0);
            const progress = Math.min(100, (totalWorkload / discipline.workload) * 100);
            
            const card = document.createElement('div');
            card.className = 'card summary-card mb-3';
            
            card.innerHTML = `
                <div class="card-body">
                    <h6>${discipline.code} - ${discipline.name}</h6>
                    <p>Carga horária: ${totalWorkload}h de ${discipline.workload}h (${progress.toFixed(1)}%)</p>
                    <div class="progress">
                        <div class="progress-bar" role="progressbar" style="width: ${progress}%" 
                            aria-valuenow="${progress}" aria-valuemin="0" aria-valuemax="100"></div>
                    </div>
                    <p class="mt-2 mb-1">Próximas aulas:</p>
                    <ul class="list-group list-group-flush">
                        ${getNextClassesList(discipline.id)}
                    </ul>
                </div>
            `;
            
            disciplineDetailsDiv.appendChild(card);
        });
    }

    // Obter lista de próximas aulas para uma disciplina
    function getNextClassesList(disciplineId) {
        const today = new Date().toISOString().split('T')[0];
        const upcomingClasses = classes
            .filter(c => c.disciplineId === disciplineId && c.date >= today)
            .sort((a, b) => a.date.localeCompare(b.date))
            .slice(0, 3); // Mostrar apenas as 3 próximas
        
        if (upcomingClasses.length === 0) {
            return '<li class="list-group-item">Nenhuma aula agendada</li>';
        }
        
        return upcomingClasses.map(c => {
            const date = new Date(c.date);
            return `
                <li class="list-group-item">
                    ${formatDate(date)} - ${c.startTime.substring(0, 5)}: ${c.topic || 'Aula'} (${getTypeName(c.type)})
                </li>
            `;
        }).join('');
    }

    // Exportar resumo para PDF (simulado)
    function exportSummary() {
        alert('Funcionalidade de exportação para PDF será implementada aqui.\nEm uma aplicação real, isso geraria um PDF com o resumo semestral.');
        // Na prática, você poderia usar bibliotecas como jsPDF ou html2pdf.js
    }

    // Salvar aulas no localStorage
    function saveClassesToLocalStorage() {
        localStorage.setItem('academicClasses', JSON.stringify(classes));
    }

    // Funções auxiliares
    function generateId() {
        return Date.now().toString() + Math.floor(Math.random() * 1000).toString();
    }

    function formatDate(date) {
        return date.toLocaleDateString('pt-BR');
    }

    function formatDateKey(date) {
        return date.toISOString().split('T')[0];
    }

    function getMonthName(monthIndex) {
        const months = [
            'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
            'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
        ];
        return months[monthIndex];
    }

    function getWeekdayName(dayIndex) {
        const days = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
        return days[dayIndex];
    }

    function getClassTypeClass(type) {
        switch(type) {
            case 'teorica': return 'theory';
            case 'pratica': return 'practice';
            case 'laboratorio': return 'lab';
            case 'orientacao': return 'orientation';
            default: return '';
        }
    }

    function getTypeName(type) {
        switch(type) {
            case 'teorica': return 'Teórica';
            case 'pratica': return 'Prática';
            case 'laboratorio': return 'Laboratório';
            case 'orientacao': return 'Orientação';
            default: return '';
        }
    }

    // Botão para abrir o resumo semestral (adicionar no cabeçalho)
    const summaryBtn = document.createElement('button');
    summaryBtn.className = 'btn btn-success ms-2';
    summaryBtn.innerHTML = '<i class="fas fa-chart-pie me-1"></i> Resumo';
    summaryBtn.addEventListener('click', () => summaryModal.show());
    document.querySelector('.card-header').appendChild(summaryBtn);
});