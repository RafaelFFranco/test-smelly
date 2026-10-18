const { UserService } = require('../src/userService');

describe('UserService', () => {
  let userService;

  beforeEach(() => {
    userService = new UserService();
    userService._clearDB();
  });

  describe('createUser', () => {
    test('retorna o usuário criado com id gerado e os dados informados', () => {
      // Arrange
      const nome = 'Fulano de Tal';
      const email = 'fulano@teste.com';
      const idade = 25;

      // Act
      const usuario = userService.createUser(nome, email, idade);

      // Assert
      expect(usuario.id).toEqual(expect.any(String));
      expect(usuario).toMatchObject({ nome, email, idade });
    });

    test('cria usuário ativo e não administrador por padrão', () => {
      // Arrange
      const nome = 'Fulano de Tal';

      // Act
      const usuario = userService.createUser(nome, 'fulano@teste.com', 25);

      // Assert
      expect(usuario.status).toBe('ativo');
      expect(usuario.isAdmin).toBe(false);
    });

    test('cria usuário administrador quando isAdmin é verdadeiro', () => {
      // Arrange
      const isAdmin = true;

      // Act
      const usuario = userService.createUser('Admin', 'admin@teste.com', 40, isAdmin);

      // Assert
      expect(usuario.isAdmin).toBe(true);
    });

    test('gera ids diferentes para usuários diferentes', () => {
      // Arrange
      const primeiro = userService.createUser('Alice', 'alice@email.com', 28);

      // Act
      const segundo = userService.createUser('Bob', 'bob@email.com', 32);

      // Assert
      expect(segundo.id).not.toBe(primeiro.id);
    });

    test('aceita usuário com exatamente 18 anos', () => {
      // Arrange
      const idadeMinima = 18;

      // Act
      const usuario = userService.createUser('Jovem', 'jovem@email.com', idadeMinima);

      // Assert
      expect(usuario.idade).toBe(18);
    });

    test('lança erro ao criar usuário menor de idade', () => {
      // Arrange
      const criarMenorDeIdade = () =>
        userService.createUser('Menor', 'menor@email.com', 17);

      // Act & Assert
      expect(criarMenorDeIdade).toThrow('O usuário deve ser maior de idade.');
    });

    test('lança erro quando o nome não é informado', () => {
      // Arrange
      const criarSemNome = () => userService.createUser('', 'sem-nome@email.com', 30);

      // Act & Assert
      expect(criarSemNome).toThrow('Nome, email e idade são obrigatórios.');
    });

    test('lança erro quando o email não é informado', () => {
      // Arrange
      const criarSemEmail = () => userService.createUser('Sem Email', '', 30);

      // Act & Assert
      expect(criarSemEmail).toThrow('Nome, email e idade são obrigatórios.');
    });

    test('lança erro quando a idade não é informada', () => {
      // Arrange
      const criarSemIdade = () =>
        userService.createUser('Sem Idade', 'sem-idade@email.com', undefined);

      // Act & Assert
      expect(criarSemIdade).toThrow('Nome, email e idade são obrigatórios.');
    });
  });

  describe('getUserById', () => {
    test('retorna o usuário cadastrado com o id informado', () => {
      // Arrange
      const usuarioCriado = userService.createUser('Fulano de Tal', 'fulano@teste.com', 25);

      // Act
      const usuarioBuscado = userService.getUserById(usuarioCriado.id);

      // Assert
      expect(usuarioBuscado).toEqual(usuarioCriado);
    });

    test('retorna null quando o id não existe', () => {
      // Arrange
      const idInexistente = 'id-inexistente';

      // Act
      const resultado = userService.getUserById(idInexistente);

      // Assert
      expect(resultado).toBeNull();
    });
  });

  describe('deactivateUser', () => {
    test('desativa um usuário comum e retorna true', () => {
      // Arrange
      const usuarioComum = userService.createUser('Comum', 'comum@teste.com', 30);

      // Act
      const resultado = userService.deactivateUser(usuarioComum.id);

      // Assert
      expect(resultado).toBe(true);
      expect(userService.getUserById(usuarioComum.id).status).toBe('inativo');
    });

    test('não desativa um administrador e retorna false', () => {
      // Arrange
      const usuarioAdmin = userService.createUser('Admin', 'admin@teste.com', 40, true);

      // Act
      const resultado = userService.deactivateUser(usuarioAdmin.id);

      // Assert
      expect(resultado).toBe(false);
      expect(userService.getUserById(usuarioAdmin.id).status).toBe('ativo');
    });

    test('retorna false quando o usuário não existe', () => {
      // Arrange
      const idInexistente = 'id-inexistente';

      // Act
      const resultado = userService.deactivateUser(idInexistente);

      // Assert
      expect(resultado).toBe(false);
    });
  });

  describe('generateUserReport', () => {
    test('inclui id, nome e status de cada usuário cadastrado', () => {
      // Arrange
      const alice = userService.createUser('Alice', 'alice@email.com', 28);
      const bob = userService.createUser('Bob', 'bob@email.com', 32);

      // Act
      const relatorio = userService.generateUserReport();

      // Assert
      expect(relatorio).toContain(alice.id);
      expect(relatorio).toContain('Alice');
      expect(relatorio).toContain(bob.id);
      expect(relatorio).toContain('Bob');
      expect(relatorio).toContain('ativo');
    });

    test('reflete o status atualizado de um usuário desativado', () => {
      // Arrange
      const usuario = userService.createUser('Carol', 'carol@email.com', 35);
      userService.deactivateUser(usuario.id);

      // Act
      const relatorio = userService.generateUserReport();

      // Assert
      expect(relatorio).toContain('inativo');
    });

    test('informa que não há usuários quando nenhum foi cadastrado', () => {
      // Arrange
      // (o beforeEach garante que o banco está vazio)

      // Act
      const relatorio = userService.generateUserReport();

      // Assert
      expect(relatorio).toContain('Nenhum usuário cadastrado.');
    });
  });
});
