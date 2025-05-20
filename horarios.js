

// Função destinada para marcar todos os campos de checkbox dentro
// da tabela.
function checkAll() {

    let inputs = document.querySelectorAll('.form-check-input');

    for (let i = 0; i < inputs.length; i++) {
        inputs[i].checked = true;
    }
}

// Função destinada para desmarcar todos os campos de checkbox dentro
// da tabela.
function uncheckAll() {
    let inputs = document.querySelectorAll('.form-check-input');

    for (let i = 0; i < inputs.length; i++) {
        inputs[i].checked = false;
    }
}

// Evento destinado para fazer com que toda vez que o usuário interagir
// e clicar em uma célula da tabela (ao qual existe um checkbox), seja
// possível clicar nela para marcar e desmarcar esse campo.
document.addEventListener('DOMContentLoaded', function () {

    // Selecionando todas as células da tabela (menos a coluna de horários).
    const tableCells = document.querySelectorAll('tbody td');

    tableCells.forEach(cell => {
        const checkbox = cell.querySelector('input[type="checkbox"]');
        if (checkbox) {

            cell.addEventListener('click', (e) => {

                if (e.target.tagName.toLowerCase() !== 'input') {
                    checkbox.checked = !checkbox.checked;

                    checkbox.dispatchEvent(new Event('change'));
                }
            });
        }
    });
});