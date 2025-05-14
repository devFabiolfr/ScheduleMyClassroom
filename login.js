document.addEventListener('DOMContentLoaded', function() {
    // 1. Configuração do toggle de senha (para login e registro)
    const toggleSenha = document.getElementById('toggleSenha');
    if (toggleSenha) {
        const senhaInput = document.getElementById('senha');
        toggleSenha.addEventListener('click', function() {
            const type = senhaInput.getAttribute('type') === 'password' ? 'text' : 'password';
            senhaInput.setAttribute('type', type);
            this.innerHTML = type === 'password' ? '<i class="fas fa-eye"></i>' : '<i class="fas fa-eye-slash"></i>';
        });
    }

    // 2. Validador de CPF (função corrigida)
    function validarCPF(cpf) {
        cpf = cpf.replace(/\D/g, '');
        
        // Verifica se tem 11 dígitos e não é uma sequência repetida
        if (cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) {
            return false;
        }

        // Calcula o primeiro dígito verificador
        let soma = 0;
        for (let i = 0; i < 9; i++) {
            soma += parseInt(cpf.charAt(i)) * (10 - i);
        }
        let resto = (soma * 10) % 11;
        if (resto === 10 || resto === 11) resto = 0;
        if (resto !== parseInt(cpf.charAt(9))) {
            return false;
        }

        // Calcula o segundo dígito verificador
        soma = 0;
        for (let i = 0; i < 10; i++) {
            soma += parseInt(cpf.charAt(i)) * (11 - i);
        }
        resto = (soma * 10) % 11;
        if (resto === 10 || resto === 11) resto = 0;
        if (resto !== parseInt(cpf.charAt(10))) {
            return false;
        }

        return true;
    }

    // 3. Máscara para CPF (funciona em ambos formulários)
    const cpfField = document.getElementById('cpf');
    if (cpfField) {
        cpfField.addEventListener('input', function(e) {
            let value = e.target.value.replace(/\D/g, '');
            
            value = value.replace(/(\d{3})(\d)/, '$1.$2')
                         .replace(/(\d{3})(\d)/, '$1.$2')
                         .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
            
            e.target.value = value.substring(0, 14);
        });
    }

    // 4. Formulário de Login
    const formularioLogin = document.getElementById('formularioLogin');
    if (formularioLogin) {
        formularioLogin.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const matricula = document.getElementById('matricula').value.trim();
            const senha = document.getElementById('senha').value.trim();
            
            if (matricula && senha) {
                const btnSubmit = this.querySelector('button[type="submit"]');
                const originalText = btnSubmit.innerHTML;
                btnSubmit.innerHTML = '<span class="loading-spinner"></span> Autenticando...';
                btnSubmit.disabled = true;
                
                setTimeout(function() {
                    window.location.href = 'index.html';
                }, 1500);
            } else {
                alert('Por favor, preencha todos os campos.');
            }
        });
    }

    // 5. Formulário de Registro
    const formularioRegistro = document.getElementById('formularioRegistro');
    if (formularioRegistro) {
        formularioRegistro.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const cpf = document.getElementById('cpf').value.replace(/\D/g, '');
            const senha = document.getElementById('senha').value;
            const confirmarSenha = document.getElementById('confirmarSenha').value;
            
            // Validação do CPF
            if (!validarCPF(cpf)) {
                alert('Por favor, insira um CPF válido!');
                document.getElementById('cpf').focus();
                return;
            }
            
            // Validação de senha
            if (senha.length < 8) {
                alert('A senha deve ter no mínimo 8 caracteres!');
                return;
            }
            
            if (senha !== confirmarSenha) {
                alert('As senhas não coincidem!');
                return;
            }
            
            // Simulação de cadastro
            const btnSubmit = this.querySelector('button[type="submit"]');
            const originalText = btnSubmit.innerHTML;
            btnSubmit.innerHTML = '<span class="loading-spinner"></span> Registrando...';
            btnSubmit.disabled = true;
            
            setTimeout(function() {
                alert('Cadastro realizado com sucesso! Redirecionando para login...');
                window.location.href = 'login.html';
            }, 2000);
        });
    }

    // 6. Efeitos visuais
    const card = document.querySelector('.card');
    if (card) {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-5px)';
            this.style.boxShadow = '0 15px 35px rgba(0, 0, 0, 0.15)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = '';
            this.style.boxShadow = '0 10px 30px rgba(0, 0, 0, 0.1)';
        });
    }
});