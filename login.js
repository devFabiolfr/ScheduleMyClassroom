// scripts-docente.js (atualizado)
document.addEventListener('DOMContentLoaded', function() {
    // Mostrar/ocultar senha
    const toggleSenha = document.getElementById('toggleSenha');
    const senhaInput = document.getElementById('senha');
    
    toggleSenha.addEventListener('click', function() {
        const type = senhaInput.getAttribute('type') === 'password' ? 'text' : 'password';
        senhaInput.setAttribute('type', type);
        this.innerHTML = type === 'password' ? '<i class="fas fa-eye"></i>' : '<i class="fas fa-eye-slash"></i>';
    });
    
    // Validação do formulário
    const formularioLogin = document.getElementById('formularioLogin');
    
    formularioLogin.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const matricula = document.getElementById('matricula').value.trim();
        const senha = document.getElementById('senha').value.trim();
        
        // Simulação de validação
        if (matricula && senha) {
            // Mostrar loading no botão
            const btnSubmit = this.querySelector('button[type="submit"]');
            const originalText = btnSubmit.innerHTML;
            btnSubmit.innerHTML = '<span class="loading-spinner"></span> Autenticando...';
            btnSubmit.disabled = true;
            
            // Simular tempo de autenticação
            setTimeout(function() {
                // Redirecionar para a página principal (index.html)
                window.location.href = 'index.html';
            }, 1500);
        } else {
            alert('Por favor, preencha todos os campos.');
        }
    });
    
    // Efeito de hover nos cards
    const card = document.querySelector('.card');
    card.addEventListener('mouseenter', function() {
        this.style.transform = 'translateY(-5px)';
        this.style.boxShadow = '0 15px 35px rgba(0, 0, 0, 0.15)';
    });
    
    card.addEventListener('mouseleave', function() {
        this.style.transform = '';
        this.style.boxShadow = '0 10px 30px rgba(0, 0, 0, 0.1)';
    });
});
// Validação do formulário de registro
if (document.getElementById('formularioRegistro')) {
    const formularioRegistro = document.getElementById('formularioRegistro');
    
    formularioRegistro.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const senha = document.getElementById('senha').value;
        const confirmarSenha = document.getElementById('confirmarSenha').value;
        
        if (senha !== confirmarSenha) {
            alert('As senhas não coincidem!');
            return;
        }
        
        // Mostrar loading no botão
        const btnSubmit = this.querySelector('button[type="submit"]');
        const originalText = btnSubmit.innerHTML;
        btnSubmit.innerHTML = '<span class="loading-spinner"></span> Registrando...';
        btnSubmit.disabled = true;
        
        // Simular cadastro (substituir por AJAX em produção)
        setTimeout(function() {
            alert('Cadastro realizado com sucesso! Redirecionando para login...');
            window.location.href = 'login.html';
        }, 2000);
    });
    
    // Toggle para mostrar/ocultar senha no registro
    const toggleSenhaRegistro = document.getElementById('toggleSenha');
    if (toggleSenhaRegistro) {
        toggleSenhaRegistro.addEventListener('click', function() {
            const senhaInput = document.getElementById('senha');
            const type = senhaInput.getAttribute('type') === 'password' ? 'text' : 'password';
            senhaInput.setAttribute('type', type);
            this.innerHTML = type === 'password' ? '<i class="fas fa-eye"></i>' : '<i class="fas fa-eye-slash"></i>';
        });
    }
}