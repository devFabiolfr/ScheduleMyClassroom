document.addEventListener('DOMContentLoaded', function() {
// 1. Toggle de senha
    const toggleSenha = document.getElementById('toggleSenha');
    const senhaInput = document.getElementById('senha');
    
    if (toggleSenha && senhaInput) {
        toggleSenha.addEventListener('click', function() {
            const type = senhaInput.getAttribute('type') === 'password' ? 'text' : 'password';
            senhaInput.setAttribute('type', type);
            
            // Alterna o ícone
            const icon = this.querySelector('i');
            icon.className = type === 'password' ? 'fas fa-eye' : 'fas fa-eye-slash';
        });
    }
    
    // Banco de dados simulado (armazenado no localStorage)
    if (!localStorage.getItem('usuariosRegistrados')) {
        localStorage.setItem('usuariosRegistrados', JSON.stringify([]));
    }

    // Função para registrar usuário
    if (document.getElementById('formularioRegistro')) {
        const formularioRegistro = document.getElementById('formularioRegistro');
        
        formularioRegistro.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const nome = document.getElementById('nomeCompleto').value.trim();
            const email = document.getElementById('email').value.trim();
            const matricula = document.getElementById('matricula').value.trim();
            const cpf = document.getElementById('cpf').value.replace(/\D/g, '');
            const senha = document.getElementById('senha').value;
            
            // Validações
            if (!validarCPF(cpf)) {
                alert('CPF inválido!');
                return;
            }
            
            if (senha.length < 8) {
                alert('A senha deve ter no mínimo 8 caracteres!');
                return;
            }
            
            // Verifica se usuário já existe
            const usuarios = JSON.parse(localStorage.getItem('usuariosRegistrados'));
            const usuarioExistente = usuarios.find(u => u.email === email || u.matricula === matricula || u.cpf === cpf);
            
            if (usuarioExistente) {
                alert('Usuário já cadastrado com estes dados!');
                return;
            }
            
            // Adiciona novo usuário
            usuarios.push({
                nome,
                email,
                matricula,
                cpf,
                senha // Em produção, isso deveria ser uma hash (não armazene senhas em claro!)
            });
            
            localStorage.setItem('usuariosRegistrados', JSON.stringify(usuarios));
            
            alert('Cadastro realizado com sucesso!');
            window.location.href = 'login.html';
        });
    }

    // Função para login
    if (document.getElementById('formularioLogin')) {
        const formularioLogin = document.getElementById('formularioLogin');
        
        formularioLogin.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const matricula = document.getElementById('matricula').value.trim();
            const senha = document.getElementById('senha').value.trim();
            
            // Busca usuário
            const usuarios = JSON.parse(localStorage.getItem('usuariosRegistrados'));
            const usuario = usuarios.find(u => u.matricula === matricula && u.senha === senha);
            
            if (usuario) {
                // Salva sessão (simulado)
                sessionStorage.setItem('usuarioLogado', JSON.stringify(usuario));
                
                // Redireciona
                window.location.href = 'index.html';
            } else {
                alert('Matrícula ou senha incorretas!');
            }
        });
    }

    // Função para verificar se o usuário está logado (protege páginas restritas)
    function verificarAutenticacao() {
        if (!sessionStorage.getItem('usuarioLogado') && window.location.pathname.includes('index.html')) {
            window.location.href = 'login.html';
        }
    }
    
    // Verifica ao carregar a página
    verificarAutenticacao();

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

// Validação do formulário de recuperação de senha
if (document.getElementById('formularioRecuperacao')) {
    const formularioRecuperacao = document.getElementById('formularioRecuperacao');
    
    formularioRecuperacao.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const email = document.getElementById('email').value.trim();
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        
        if (!emailRegex.test(email)) {
            alert('Por favor, insira um e-mail válido!');
            return;
        }
        
        // Mostrar loading no botão
        const btnSubmit = this.querySelector('button[type="submit"]');
        const originalText = btnSubmit.innerHTML;
        btnSubmit.innerHTML = '<span class="loading-spinner"></span> Enviando...';
        btnSubmit.disabled = true;
        
        // Simular envio (substituir por AJAX em produção)
        setTimeout(function() {
            alert(`Link de recuperação enviado para ${email}\n(Simulação - em produção seria enviado por e-mail)`);
            btnSubmit.innerHTML = originalText;
            btnSubmit.disabled = false;
        }, 2000);
    });
}

// Verificação de usuário logado e logout
function verificarUsuarioLogado() {
    const usuarioLogado = JSON.parse(sessionStorage.getItem('usuarioLogado'));
    
    if (!usuarioLogado && window.location.pathname.includes('index.html')) {
        window.location.href = 'login.html';
        return;
    }
    
    // Atualiza nome do usuário na navbar
    if (usuarioLogado && document.getElementById('nomeUsuario')) {
        document.getElementById('nomeUsuario').textContent = usuarioLogado.nome || 'Usuário';
    }
    
    // Configura logout
    if (document.getElementById('btnLogout')) {
        document.getElementById('btnLogout').addEventListener('click', function() {
            sessionStorage.removeItem('usuarioLogado');
            window.location.href = 'login.html';
        });
    }
}

// Execute quando a página carregar
document.addEventListener('DOMContentLoaded', verificarUsuarioLogado);