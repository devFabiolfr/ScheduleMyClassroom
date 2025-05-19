// Verificação do token na URL
document.addEventListener('DOMContentLoaded', function() {
    // Extrai token e e-mail da URL
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');
    const email = urlParams.get('email');
    
    if (!token || !email) {
        alert('Link inválido ou expirado!');
        window.location.href = 'recuperar-senha.html';
        return;
    }
    
    // Preenche os campos ocultos
    document.getElementById('token').value = token;
    document.getElementById('email').value = email;
    
    // Configura validação em tempo real
    const novaSenha = document.getElementById('novaSenha');
    const confirmarSenha = document.getElementById('confirmarSenha');
    
    // Mostrar/ocultar senha
    document.getElementById('toggleSenha').addEventListener('click', function() {
        const type = novaSenha.getAttribute('type') === 'password' ? 'text' : 'password';
        novaSenha.setAttribute('type', type);
        this.innerHTML = type === 'password' ? '<i class="fas fa-eye"></i>' : '<i class="fas fa-eye-slash"></i>';
    });
    
    // Força da senha
    novaSenha.addEventListener('input', function() {
        const strength = calcularForcaSenha(this.value);
        const strengthBar = document.getElementById('passwordStrength');
        
        strengthBar.className = 'password-strength';
        if (this.value.length === 0) {
            strengthBar.style.width = '0%';
        } else {
            strengthBar.classList.add(`strength-${strength}`);
        }
    });
    
    // Validação de confirmação
    confirmarSenha.addEventListener('input', function() {
        if (this.value !== novaSenha.value) {
            this.classList.add('is-invalid');
        } else {
            this.classList.remove('is-invalid');
        }
    });
    
    // Envio do formulário
    document.getElementById('formRedefinicao').addEventListener('submit', function(e) {
        e.preventDefault();
        
        const senha = novaSenha.value;
        const confirmacao = confirmarSenha.value;
        
        if (senha !== confirmacao) {
            alert('As senhas não coincidem!');
            return;
        }
        
        if (senha.length < 8) {
            alert('A senha deve ter no mínimo 8 caracteres!');
            return;
        }
        
        // Simulação de requisição ao servidor
        const btnSubmit = this.querySelector('button[type="submit"]');
        btnSubmit.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Salvando...';
        btnSubmit.disabled = true;
        
        setTimeout(() => {
            // Em produção, faria uma requisição AJAX para o servidor
            const usuarios = JSON.parse(localStorage.getItem('usuariosRegistrados')) || [];
            const usuarioIndex = usuarios.findIndex(u => u.email === email);
            
            if (usuarioIndex !== -1) {
                usuarios[usuarioIndex].senha = senha; // Em produção: usar bcrypt
                localStorage.setItem('usuariosRegistrados', JSON.stringify(usuarios));
                
                alert('Senha redefinida com sucesso!');
                window.location.href = 'login.html';
            } else {
                alert('Erro: usuário não encontrado');
                btnSubmit.innerHTML = '<i class="fas fa-save me-2"></i>Salvar Nova Senha';
                btnSubmit.disabled = false;
            }
        }, 1500);
    });
});

function calcularForcaSenha(senha) {
    const hasLetters = /[a-zA-Z]/.test(senha);
    const hasNumbers = /\d/.test(senha);
    const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(senha);
    
    let strength = 0;
    if (senha.length >= 8) strength++;
    if (hasLetters) strength++;
    if (hasNumbers) strength++;
    if (hasSpecial) strength++;
    
    if (strength < 2) return 'weak';
    if (strength < 4) return 'medium';
    return 'strong';
}