-- ============================================
-- QUERIES DOCUMENTADAS - PRODUTOS
-- ============================================
-- Este arquivo contém as queries SQL utilizadas pela API de produtos
-- Todas as queries são parametrizadas para evitar SQL Injection
-- ============================================

-- ============================================
-- LISTAGEM DE PRODUTOS COM PAGINAÇÃO
-- ============================================
-- Descrição: Lista produtos com filtros e paginação
-- Parâmetros:
--   @codEmpresa: Código da empresa (obrigatório - multiempresa)
--   @offset: Número de registros a pular (para paginação)
--   @pageSize: Número de registros por página
--   @search: Termo de busca (opcional - busca em DES_PRODUTO e COD_PRODUTO)
--   @sit: Filtro por situação (opcional - SIT_PRODUTO)
--   @ind: Filtro por tipo produto/serviço (opcional - IND_PRODUTO_SERVICO)
-- ============================================

-- Query de contagem total
SELECT COUNT(*) as total
FROM dbo.PRODUTOS_SERVICOS
WHERE COD_EMPRESA = @codEmpresa
  AND (@search IS NULL OR (DES_PRODUTO LIKE @search OR CAST(COD_PRODUTO AS VARCHAR) LIKE @search))
  AND (@sit IS NULL OR SIT_PRODUTO = @sit)
  AND (@ind IS NULL OR IND_PRODUTO_SERVICO = @ind);

-- Query de listagem com paginação
SELECT 
  COD_EMPRESA,
  COD_PRODUTO,
  DES_PRODUTO,
  COD_UNIDADE_MEDIDA,
  IND_PRODUTO_SERVICO,
  SIT_PRODUTO,
  OBS_PRODUTO,
  DAT_CADASTRO,
  DAT_ALTERACAO,
  COD_USUARIO
FROM dbo.PRODUTOS_SERVICOS
WHERE COD_EMPRESA = @codEmpresa
  AND (@search IS NULL OR (DES_PRODUTO LIKE @search OR CAST(COD_PRODUTO AS VARCHAR) LIKE @search))
  AND (@sit IS NULL OR SIT_PRODUTO = @sit)
  AND (@ind IS NULL OR IND_PRODUTO_SERVICO = @ind)
ORDER BY COD_PRODUTO
OFFSET @offset ROWS
FETCH NEXT @pageSize ROWS ONLY;

-- ============================================
-- OBTER PRODUTO POR CÓDIGO
-- ============================================
-- Descrição: Retorna um produto específico
-- Parâmetros:
--   @codEmpresa: Código da empresa
--   @codProduto: Código do produto
-- ============================================
SELECT 
  COD_EMPRESA,
  COD_PRODUTO,
  DES_PRODUTO,
  COD_UNIDADE_MEDIDA,
  IND_PRODUTO_SERVICO,
  SIT_PRODUTO,
  OBS_PRODUTO,
  DAT_CADASTRO,
  DAT_ALTERACAO,
  COD_USUARIO
FROM dbo.PRODUTOS_SERVICOS
WHERE COD_EMPRESA = @codEmpresa AND COD_PRODUTO = @codProduto;

-- ============================================
-- CRIAR PRODUTO
-- ============================================
-- Descrição: Insere um novo produto
-- Parâmetros:
--   @codEmpresa: Código da empresa
--   @codProduto: Código do produto (gerado automaticamente se não fornecido)
--   @desProduto: Descrição do produto (obrigatório)
--   @codUnidadeMedida: Código da unidade de medida
--   @indProdutoServico: Indicador produto/serviço
--   @sitProduto: Situação do produto (padrão: 'A' - Ativo)
--   @obsProduto: Observações
--   @codUsuario: Código do usuário que está criando
-- ============================================
-- Primeiro, obter próximo código
SELECT ISNULL(MAX(COD_PRODUTO), 0) + 1 as proximo_cod
FROM dbo.PRODUTOS_SERVICOS
WHERE COD_EMPRESA = @codEmpresa;

-- Depois, inserir
INSERT INTO dbo.PRODUTOS_SERVICOS (
  COD_EMPRESA,
  COD_PRODUTO,
  DES_PRODUTO,
  COD_UNIDADE_MEDIDA,
  IND_PRODUTO_SERVICO,
  SIT_PRODUTO,
  OBS_PRODUTO,
  DAT_CADASTRO,
  COD_USUARIO
)
VALUES (
  @codEmpresa,
  @codProduto,
  @desProduto,
  @codUnidadeMedida,
  @indProdutoServico,
  @sitProduto,
  @obsProduto,
  GETDATE(),
  @codUsuario
);

-- ============================================
-- ATUALIZAR PRODUTO
-- ============================================
-- Descrição: Atualiza um produto existente
-- Parâmetros: Mesmos do criar, mas todos opcionais (apenas os fornecidos são atualizados)
-- ============================================
UPDATE dbo.PRODUTOS_SERVICOS
SET 
  DES_PRODUTO = @desProduto,
  COD_UNIDADE_MEDIDA = @codUnidadeMedida,
  IND_PRODUTO_SERVICO = @indProdutoServico,
  SIT_PRODUTO = @sitProduto,
  OBS_PRODUTO = @obsProduto,
  COD_USUARIO = @codUsuario,
  DAT_ALTERACAO = GETDATE()
WHERE COD_EMPRESA = @codEmpresa AND COD_PRODUTO = @codProduto;

-- ============================================
-- INATIVAR PRODUTO (SOFT DELETE)
-- ============================================
-- Descrição: Inativa um produto (soft delete)
-- Usado quando o produto tem relacionamentos (derivacoes, estoques, etc.)
-- Parâmetros:
--   @codEmpresa: Código da empresa
--   @codProduto: Código do produto
-- ============================================
UPDATE dbo.PRODUTOS_SERVICOS
SET SIT_PRODUTO = 'I', DAT_ALTERACAO = GETDATE()
WHERE COD_EMPRESA = @codEmpresa AND COD_PRODUTO = @codProduto;

-- ============================================
-- LISTAR DERIVAÇÕES DE UM PRODUTO
-- ============================================
-- Descrição: Lista todas as derivações de um produto
-- Parâmetros:
--   @codEmpresa: Código da empresa
--   @codProduto: Código do produto
-- ============================================
SELECT 
  COD_EMPRESA,
  COD_PRODUTO,
  COD_DERIVACAO,
  DES_DERIVACAO,
  COD_BARRA,
  SIT_DERIVACAO,
  OBS_DERIVACAO,
  DAT_CADASTRO,
  DAT_ALTERACAO,
  COD_USUARIO
FROM dbo.DERIVACOES
WHERE COD_EMPRESA = @codEmpresa AND COD_PRODUTO = @codProduto
ORDER BY COD_DERIVACAO;

-- ============================================
-- LISTAR ESTOQUES DE UM PRODUTO
-- ============================================
-- Descrição: Lista todos os estoques de um produto por depósito e derivação
-- Parâmetros:
--   @codEmpresa: Código da empresa
--   @codProduto: Código do produto
-- ============================================
SELECT 
  COD_EMPRESA,
  COD_PRODUTO,
  COD_DEPOSITO,
  COD_DERIVACAO,
  QTD_ATUAL,
  QTD_RESERVADA,
  ACE_ESTOQUE_NEGATIVO,
  DAT_ALTERACAO,
  COD_USUARIO
FROM dbo.ESTOQUES
WHERE COD_EMPRESA = @codEmpresa AND COD_PRODUTO = @codProduto
ORDER BY COD_DEPOSITO, COD_DERIVACAO;
