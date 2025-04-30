
document.addEventListener('DOMContentLoaded', function() {
    // Elementos do DOM
    const calendarGrid = document.getElementById('calendarGrid');
    const currentMonthYear = document.getElementById('currentMonthYear');
    const prevMonthBtn = document.getElementById('prevMonth');
    const nextMonthBtn = document.getElementById('nextMonth');
    const eventModal = new bootstrap.Modal(document.getElementById('eventModal'));
    const eventForm = document.getElementById('eventForm');
    const saveEventBtn = document.getElementById('saveEventBtn');
    const deleteEventBtn = document.getElementById('deleteEventBtn');
    const eventTitleInput = document.getElementById('eventTitle');
    const eventDateInput = document.getElementById('eventDate');
    const eventDescriptionInput = document.getElementById('eventDescription');
    const eventColorInput = document.getElementById('eventColor');
    
    // Estado da aplicação
    let currentDate = new Date();
    let events = JSON.parse(localStorage.getItem('calendarEvents')) || [];
    let selectedDate = null;
    let selectedEvent = null;
    
    // Inicializar o calendário
    renderCalendar();
    
    // Event Listeners
    prevMonthBtn.addEventListener('click', () => {
        currentDate.setMonth(currentDate.getMonth() - 1);
        renderCalendar();
    });
    
    nextMonthBtn.addEventListener('click', () => {
        currentDate.setMonth(currentDate.getMonth() + 1);
        renderCalendar();
    });
    
    saveEventBtn.addEventListener('click', saveEvent);
    deleteEventBtn.addEventListener('click', deleteEvent);
    
    // Função para renderizar o calendário
    function renderCalendar() {
        // Atualizar o cabeçalho com mês/ano atual
        currentMonthYear.textContent = `${getMonthName(currentDate.getMonth())} ${currentDate.getFullYear()}`;
        
        // Limpar o grid
        calendarGrid.innerHTML = '';
        
        // Obter primeiro dia do mês e último dia do mês
        const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
        const lastDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
        
        // Obter o dia da semana do primeiro dia (0-6, Domingo-Sábado)
        const startingDayOfWeek = firstDayOfMonth.getDay();
        
        // Obter o número total de dias no mês
        const totalDays = lastDayOfMonth.getDate();
        
        // Criar dias vazios para o início do mês (se não começar no Domingo)
        for (let i = 0; i < startingDayOfWeek; i++) {
            const emptyDay = document.createElement('div');
            emptyDay.classList.add('calendar-day', 'empty');
            calendarGrid.appendChild(emptyDay);
        }
        
        // Criar dias do mês
        const today = new Date();
        for (let day = 1; day <= totalDays; day++) {
            const dayElement = document.createElement('div');
            dayElement.classList.add('calendar-day');
            
            // Verificar se é o dia atual
            if (currentDate.getFullYear() === today.getFullYear() && 
                currentDate.getMonth() === today.getMonth() && 
                day === today.getDate()) {
                dayElement.classList.add('today');
            }
            
            // Adicionar número do dia
            const dayNumber = document.createElement('div');
            dayNumber.classList.add('calendar-day-number');
            dayNumber.textContent = day;
            dayElement.appendChild(dayNumber);
            
            // Adicionar eventos para este dia
            const dateKey = formatDateKey(new Date(currentDate.getFullYear(), currentDate.getMonth(), day));
            const dayEvents = events.filter(event => event.date === dateKey);
            
            dayEvents.forEach(event => {
                const eventElement = document.createElement('div');
                eventElement.classList.add('event-item');
                eventElement.textContent = event.title;
                eventElement.style.backgroundColor = event.color;
                eventElement.dataset.eventId = event.id;
                eventElement.addEventListener('click', (e) => {
                    e.stopPropagation();
                    openEditEventModal(event);
                });
                dayElement.appendChild(eventElement);
            });
            
            // Adicionar listener para adicionar novo evento
            dayElement.addEventListener('click', () => {
                selectedDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
                openNewEventModal();
            });
            
            calendarGrid.appendChild(dayElement);
        }
    }
    
    // Função para abrir modal de novo evento
    function openNewEventModal() {
        selectedEvent = null;
        eventForm.reset();
        eventDateInput.value = formatDateInput(selectedDate);
        deleteEventBtn.style.display = 'none';
        document.getElementById('modalTitle').textContent = 'Adicionar Evento';
        saveEventBtn.textContent = 'Salvar';
        eventModal.show();
    }
    
    // Função para abrir modal de edição de evento
    function openEditEventModal(event) {
        selectedEvent = event;
        eventTitleInput.value = event.title;
        eventDateInput.value = event.date;
        eventDescriptionInput.value = event.description || '';
        eventColorInput.value = event.color;
        deleteEventBtn.style.display = 'block';
        document.getElementById('modalTitle').textContent = 'Editar Evento';
        saveEventBtn.textContent = 'Atualizar';
        eventModal.show();
    }
    
    // Função para salvar evento
    function saveEvent() {
        const eventData = {
            id: selectedEvent ? selectedEvent.id : Date.now().toString(),
            title: eventTitleInput.value.trim(),
            date: eventDateInput.value,
            description: eventDescriptionInput.value.trim(),
            color: eventColorInput.value
        };
        
        if (!eventData.title) {
            alert('Por favor, insira um título para o evento.');
            return;
        }
        
        if (selectedEvent) {
            // Atualizar evento existente
            const index = events.findIndex(e => e.id === selectedEvent.id);
            if (index !== -1) {
                events[index] = eventData;
            }
        } else {
            // Adicionar novo evento
            events.push(eventData);
        }
        
        saveEventsToLocalStorage();
        renderCalendar();
        eventModal.hide();
    }
    
    // Função para excluir evento
    function deleteEvent() {
        if (selectedEvent && confirm('Tem certeza que deseja excluir este evento?')) {
            events = events.filter(event => event.id !== selectedEvent.id);
            saveEventsToLocalStorage();
            renderCalendar();
            eventModal.hide();
        }
    }
    
    // Função auxiliar para salvar eventos no localStorage
    function saveEventsToLocalStorage() {
        localStorage.setItem('calendarEvents', JSON.stringify(events));
    }
    
    // Funções auxiliares de formatação
    function formatDateKey(date) {
        return date.toISOString().split('T')[0];
    }
    
    function formatDateInput(date) {
        const year = date.getFullYear();
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const day = date.getDate().toString().padStart(2, '0');
        return `${year}-${month}-${day}`;
    }
    
    function getMonthName(monthIndex) {
        const months = [
            'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
            'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
        ];
        return months[monthIndex];
    }
});