-- ============================================
-- QUERIES DOCUMENTADAS - AUTENTICAÇÃO
-- ============================================
-- Este arquivo contém as queries SQL utilizadas pela API de autenticação
-- Todas as queries são parametrizadas para evitar SQL Injection
-- ============================================

-- ============================================
-- OBTER USUÁRIO POR LOGIN
-- ============================================
-- Descrição: Busca um usuário pelo login (ABR_USUARIO ou NOM_USUARIO)
-- Parâmetros:
--   @login: Login do usuário (pode ser ABR_USUARIO ou NOM_USUARIO)
-- Retorna: Dados do usuário se encontrado e ativo
-- ============================================
SELECT 
  COD_USUARIO,
  COD_GRUPO_USUARIO,
  NOM_USUARIO,
  ABR_USUARIO,
  SEN_USUARIO,
  EMP_USUARIO,
  SIT_USUARIO,
  IND_CRIPTOGRAFADO,
  NUM_WHATSAPP,
  TELAS_BI_ACESSO,
  NUM_TOKEN_POWER_BI,
  DAT_CADASTRO,
  DAT_ALTERACAO
FROM dbo.USUARIOS
WHERE (ABR_USUARIO = @login OR NOM_USUARIO = @login)
  AND SIT_USUARIO = 'A';

-- ============================================
-- OBTER USUÁRIO POR CÓDIGO
-- ============================================
-- Descrição: Busca um usuário pelo código
-- Parâmetros:
--   @codUsuario: Código do usuário
-- ============================================
SELECT 
  COD_USUARIO,
  COD_GRUPO_USUARIO,
  NOM_USUARIO,
  ABR_USUARIO,
  SEN_USUARIO,
  EMP_USUARIO,
  SIT_USUARIO,
  IND_CRIPTOGRAFADO,
  NUM_WHATSAPP,
  TELAS_BI_ACESSO,
  NUM_TOKEN_POWER_BI,
  DAT_CADASTRO,
  DAT_ALTERACAO
FROM dbo.USUARIOS
WHERE COD_USUARIO = @codUsuario;

-- ============================================
-- OBTER GRUPO DE USUÁRIO
-- ============================================
-- Descrição: Busca informações do grupo de usuário
-- Parâmetros:
--   @codGrupoUsuario: Código do grupo de usuário
-- ============================================
SELECT 
  COD_GRUPO_USUARIO,
  NOM_GRUPO_USUARIO,
  NIV_GRUPO,
  IND_PRECO_CUSTO,
  PER_MARGEM_MIN_CUSTO
FROM dbo.GRUPOS_USUARIOS
WHERE COD_GRUPO_USUARIO = @codGrupoUsuario;

-- ============================================
-- OBTER MENUS E PERMISSÕES DO GRUPO
-- ============================================
-- Descrição: Lista todos os menus e permissões de um grupo de usuário
-- Parâmetros:
--   @codGrupoUsuario: Código do grupo de usuário
-- Retorna: Lista de menus com permissões (PER_ACESSO, INC_REGISTRO, ALT_REGISTRO, EXC_REGISTRO, PES_REGISTRO)
-- ============================================
SELECT 
  COD_GRUPO_USUARIO,
  NOM_MENU,
  PER_ACESSO,
  INC_REGISTRO,
  ALT_REGISTRO,
  EXC_REGISTRO,
  PES_REGISTRO,
  IND_SISTEMA
FROM dbo.MENUS_GRUPOS_USUARIOS
WHERE COD_GRUPO_USUARIO = @codGrupoUsuario;

-- ============================================
-- NOTAS IMPORTANTES
-- ============================================
-- 1. Validação de Senha:
--    - Se IND_CRIPTOGRAFADO = 'S', a senha está criptografada (usar bcrypt)
--    - Se IND_CRIPTOGRAFADO = 'N', a senha está em texto plano (comparação direta)
--
-- 2. Situação do Usuário:
--    - SIT_USUARIO = 'A' significa usuário ativo
--    - Apenas usuários ativos podem fazer login
--
-- 3. Multiempresa:
--    - O sistema suporta multiempresa através do campo COD_EMPRESA
--    - O COD_EMPRESA pode vir do login ou ser usado o DEFAULT_COD_EMPRESA do .env
--    - O token JWT contém o COD_EMPRESA ativo do usuário
-- ============================================
