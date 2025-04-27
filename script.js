    document.getElementById('form').addEventListener('submit', function(event) {
    event.preventDefault();

    const semestre = document.getElementById('semestre').value;
    const disciplina = document.getElementById('disciplina').value;
    const dia = document.getElementById('dia').value;
    const horario = document.getElementById('horario').value;
    const cargaHoraria = document.getElementById('carga-horaria').value;

    const aulasList = document.getElementById('aulas-list');
    const li = document.createElement('li');
    li.textContent = `Semestre: ${semestre}, Disciplina: ${disciplina}, Dia: ${dia}, Horário: ${horario}, Carga Horária: ${cargaHoraria} horas`;
    aulasList.appendChild(li);

    // Limpar o formulário
    document.getElementById('form').reset();
});