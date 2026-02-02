import { getAppDataSource, inicializarDataSource } from "../orm/data-source";
import { poolBanco } from "../db/pool-banco";
import { ProdutoServico } from "../entities/ProdutoServico";
import { Derivacao } from "../entities/Derivacao";
import { Estoque } from "../entities/Estoque";
import { ProdutoServicoDB, DerivacaoDB, EstoqueDB } from "../tipos/produto-db";
import { FindOptionsWhere } from "typeorm";
import { logger } from "../utils/logger";
import { PAGINACAO_PADRAO } from "../constants/paginacao";
import type { EmpresaConfig } from "../entities/EmpresaConfig";

export class ProdutoRepositoryORM {
  async listar(
    codEmpresa: number,
    filtros: {
      page?: number;
      pageSize?: number;
      search?: string;
      sit?: string;
      ind?: string;
    },
    empresaConfig: EmpresaConfig
  ): Promise<{ produtos: ProdutoServicoDB[]; total: number }> {
    try {
      await inicializarDataSource(empresaConfig);
      const dataSource = getAppDataSource();
      const repository = dataSource.getRepository(ProdutoServico);

      const page = filtros.page || PAGINACAO_PADRAO.PAGE_DEFAULT;
      const pageSizeRaw = filtros.pageSize || PAGINACAO_PADRAO.PAGE_SIZE;
      const pageSize = Math.min(pageSizeRaw, PAGINACAO_PADRAO.PAGE_SIZE_MAX);
      const skip = (page - 1) * pageSize;

    const where: FindOptionsWhere<ProdutoServico> = {
      COD_EMPRESA: codEmpresa,
    };

    if (filtros.sit) {
      where.SIT_PRODUTO = filtros.sit;
    }

    if (filtros.ind) {
      where.IND_PRODUTO_SERVICO = filtros.ind;
    }

    const queryBuilder = repository.createQueryBuilder("produto");

    queryBuilder.where("produto.COD_EMPRESA = :codEmpresa", { codEmpresa });

    if (filtros.search) {
      queryBuilder.andWhere(
        "(produto.DES_PRODUTO LIKE :search OR CAST(produto.COD_PRODUTO AS VARCHAR) LIKE :search)",
        { search: `%${filtros.search}%` }
      );
    }

    if (filtros.sit) {
      queryBuilder.andWhere("produto.SIT_PRODUTO = :sit", { sit: filtros.sit });
    }

    if (filtros.ind) {
      queryBuilder.andWhere("produto.IND_PRODUTO_SERVICO = :ind", {
        ind: filtros.ind,
      });
    }

    const [produtos, total] = await queryBuilder
      .orderBy("produto.COD_PRODUTO", "ASC")
      .skip(skip)
      .take(pageSize)
      .getManyAndCount();

      return {
        produtos: produtos.map(this.mapearParaDB),
        total,
      };
    } catch (erro) {
      logger.warn("Erro ao listar produtos com TypeORM, usando SQL raw", {
        codEmpresa,
        erro: erro instanceof Error ? erro.message : String(erro),
      });

      const page = filtros.page || PAGINACAO_PADRAO.PAGE_DEFAULT;
      const pageSizeRaw = filtros.pageSize || PAGINACAO_PADRAO.PAGE_SIZE;
      const pageSize = Math.min(pageSizeRaw, PAGINACAO_PADRAO.PAGE_SIZE_MAX);
      const offset = (page - 1) * pageSize;

      const whereConditions = ["COD_EMPRESA = @codEmpresa"];
      const parametros: Record<string, string | number | boolean | Date | null> = {
        codEmpresa,
        offset,
        pageSize,
      };

      if (filtros.search) {
        whereConditions.push(
          "(DES_PRODUTO LIKE @search OR CAST(COD_PRODUTO AS VARCHAR) LIKE @search)"
        );
        parametros.search = `%${filtros.search}%`;
      }

      if (filtros.sit) {
        whereConditions.push("SIT_PRODUTO = @sit");
        parametros.sit = filtros.sit;
      }

      if (filtros.ind) {
        whereConditions.push("IND_PRODUTO_SERVICO = @ind");
        parametros.ind = filtros.ind;
      }

      const whereClause = whereConditions.join(" AND ");

      const queryCount = `
        SELECT COUNT(*) as total
        FROM dbo.PRODUTOS_SERVICOS
        WHERE ${whereClause}
      `;

      const queryList = `
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
        WHERE ${whereClause}
        ORDER BY COD_PRODUTO
        OFFSET @offset ROWS
        FETCH NEXT @pageSize ROWS ONLY
      `;

      const [totalResult, produtos] = await Promise.all([
        poolBanco.executarConsulta<{ total: number }>(queryCount, parametros, empresaConfig),
        poolBanco.executarConsulta<ProdutoServicoDB>(queryList, parametros, empresaConfig),
      ]);

      return {
        produtos,
        total: totalResult[0]?.total || 0,
      };
    }
  }

  async obterPorCodigo(
    codEmpresa: number,
    codProduto: number,
    empresaConfig: EmpresaConfig
  ): Promise<ProdutoServicoDB | null> {
    try {
      await inicializarDataSource(empresaConfig);
      const dataSource = getAppDataSource();
      const repository = dataSource.getRepository(ProdutoServico);

      const produto = await repository.findOne({
        where: {
          COD_EMPRESA: codEmpresa,
          COD_PRODUTO: codProduto,
        },
      });

      return produto ? this.mapearParaDB(produto) : null;
    } catch (erro) {
      logger.warn("Erro ao obter produto com TypeORM, usando SQL raw", {
        codEmpresa,
        codProduto,
        erro: erro instanceof Error ? erro.message : String(erro),
      });

      const query = `
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
        WHERE COD_EMPRESA = @codEmpresa AND COD_PRODUTO = @codProduto
      `;

      const resultados = await poolBanco.executarConsulta<ProdutoServicoDB>(
        query,
        { codEmpresa, codProduto },
        empresaConfig
      );

      return resultados[0] || null;
    }
  }

  async criar(
    codEmpresa: number,
    dados: Omit<
      ProdutoServicoDB,
      "COD_EMPRESA" | "COD_PRODUTO" | "DAT_CADASTRO" | "DAT_ALTERACAO"
    >,
    empresaConfig: EmpresaConfig
  ): Promise<number> {
    try {
      await inicializarDataSource(empresaConfig);
      const dataSource = getAppDataSource();
      const repository = dataSource.getRepository(ProdutoServico);

      const maxResult = await repository
        .createQueryBuilder("produto")
        .select("MAX(produto.COD_PRODUTO)", "max")
        .where("produto.COD_EMPRESA = :codEmpresa", { codEmpresa })
        .getRawOne();

      const codProduto = (maxResult?.max || 0) + 1;

      const produto = repository.create({
      COD_EMPRESA: codEmpresa,
      COD_PRODUTO: codProduto,
      DES_PRODUTO: dados.DES_PRODUTO || null,
      COD_UNIDADE_MEDIDA: dados.COD_UNIDADE_MEDIDA || null,
      IND_PRODUTO_SERVICO: dados.IND_PRODUTO_SERVICO || null,
      SIT_PRODUTO: dados.SIT_PRODUTO || "A",
      OBS_PRODUTO: dados.OBS_PRODUTO || null,
      DAT_CADASTRO: new Date(),
      COD_USUARIO: dados.COD_USUARIO || null,
    });

      await repository.save(produto);

      return codProduto;
    } catch (erro) {
      logger.warn("Erro ao criar produto com TypeORM, usando SQL raw", {
        codEmpresa,
        erro: erro instanceof Error ? erro.message : String(erro),
      });

      const queryMax = `
        SELECT ISNULL(MAX(COD_PRODUTO), 0) + 1 as proximo_cod
        FROM dbo.PRODUTOS_SERVICOS
        WHERE COD_EMPRESA = @codEmpresa
      `;

      const maxResult = await poolBanco.executarConsulta<{ proximo_cod: number }>(
        queryMax,
        { codEmpresa },
        empresaConfig
      );

      const codProduto = maxResult[0]?.proximo_cod || 1;

      const query = `
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
        )
      `;

      await poolBanco.executarComando(
        query,
        {
          codEmpresa,
          codProduto,
          desProduto: dados.DES_PRODUTO || null,
          codUnidadeMedida: dados.COD_UNIDADE_MEDIDA || null,
          indProdutoServico: dados.IND_PRODUTO_SERVICO || null,
          sitProduto: dados.SIT_PRODUTO || "A",
          obsProduto: dados.OBS_PRODUTO || null,
          codUsuario: dados.COD_USUARIO || null,
        },
        empresaConfig
      );

      return codProduto;
    }
  }

  async atualizar(
    codEmpresa: number,
    codProduto: number,
    dados: Partial<
      Omit<
        ProdutoServicoDB,
        "COD_EMPRESA" | "COD_PRODUTO" | "DAT_CADASTRO" | "DAT_ALTERACAO"
      >
    >,
    empresaConfig: EmpresaConfig
  ): Promise<void> {
    try {
      await inicializarDataSource(empresaConfig);
      const dataSource = getAppDataSource();
      const repository = dataSource.getRepository(ProdutoServico);

      const updateData: Partial<ProdutoServico> = {
        DAT_ALTERACAO: new Date(),
      };

      if (dados.DES_PRODUTO !== undefined) {
        updateData.DES_PRODUTO = dados.DES_PRODUTO;
      }

    if (dados.COD_UNIDADE_MEDIDA !== undefined) {
      updateData.COD_UNIDADE_MEDIDA = dados.COD_UNIDADE_MEDIDA;
    }

    if (dados.IND_PRODUTO_SERVICO !== undefined) {
      updateData.IND_PRODUTO_SERVICO = dados.IND_PRODUTO_SERVICO;
    }

    if (dados.SIT_PRODUTO !== undefined) {
      updateData.SIT_PRODUTO = dados.SIT_PRODUTO;
    }

    if (dados.OBS_PRODUTO !== undefined) {
      updateData.OBS_PRODUTO = dados.OBS_PRODUTO;
    }

      if (dados.COD_USUARIO !== undefined) {
        updateData.COD_USUARIO = dados.COD_USUARIO;
      }

      await repository.update(
        {
          COD_EMPRESA: codEmpresa,
          COD_PRODUTO: codProduto,
        },
        updateData
      );
    } catch (erro) {
      logger.warn("Erro ao atualizar produto com TypeORM, usando SQL raw", {
        codEmpresa,
        codProduto,
        erro: erro instanceof Error ? erro.message : String(erro),
      });

      const campos: string[] = [];
      const parametros: Record<string, string | number | boolean | Date | null> = {
        codEmpresa,
        codProduto,
      };

      if (dados.DES_PRODUTO !== undefined) {
        campos.push("DES_PRODUTO = @desProduto");
        parametros.desProduto = dados.DES_PRODUTO;
      }

      if (dados.COD_UNIDADE_MEDIDA !== undefined) {
        campos.push("COD_UNIDADE_MEDIDA = @codUnidadeMedida");
        parametros.codUnidadeMedida = dados.COD_UNIDADE_MEDIDA;
      }

      if (dados.IND_PRODUTO_SERVICO !== undefined) {
        campos.push("IND_PRODUTO_SERVICO = @indProdutoServico");
        parametros.indProdutoServico = dados.IND_PRODUTO_SERVICO;
      }

      if (dados.SIT_PRODUTO !== undefined) {
        campos.push("SIT_PRODUTO = @sitProduto");
        parametros.sitProduto = dados.SIT_PRODUTO;
      }

      if (dados.OBS_PRODUTO !== undefined) {
        campos.push("OBS_PRODUTO = @obsProduto");
        parametros.obsProduto = dados.OBS_PRODUTO;
      }

      if (dados.COD_USUARIO !== undefined) {
        campos.push("COD_USUARIO = @codUsuario");
        parametros.codUsuario = dados.COD_USUARIO;
      }

      if (campos.length === 0) {
        return;
      }

      campos.push("DAT_ALTERACAO = GETDATE()");

      const query = `
        UPDATE dbo.PRODUTOS_SERVICOS
        SET ${campos.join(", ")}
        WHERE COD_EMPRESA = @codEmpresa AND COD_PRODUTO = @codProduto
      `;

      await poolBanco.executarComando(query, parametros, empresaConfig);
    }
  }

  async inativar(
    codEmpresa: number,
    codProduto: number,
    empresaConfig: EmpresaConfig
  ): Promise<void> {
    try {
      await inicializarDataSource(empresaConfig);
      const dataSource = getAppDataSource();
      const repository = dataSource.getRepository(ProdutoServico);

      await repository.update(
        {
          COD_EMPRESA: codEmpresa,
          COD_PRODUTO: codProduto,
        },
        {
          SIT_PRODUTO: "I",
          DAT_ALTERACAO: new Date(),
        }
      );
    } catch (erro) {
      logger.warn("Erro ao inativar produto com TypeORM, usando SQL raw", {
        codEmpresa,
        codProduto,
        erro: erro instanceof Error ? erro.message : String(erro),
      });

      const query = `
        UPDATE dbo.PRODUTOS_SERVICOS
        SET SIT_PRODUTO = 'I', DAT_ALTERACAO = GETDATE()
        WHERE COD_EMPRESA = @codEmpresa AND COD_PRODUTO = @codProduto
      `;

      await poolBanco.executarComando(query, { codEmpresa, codProduto }, empresaConfig);
    }
  }

  async listarDerivacoes(
    codEmpresa: number,
    codProduto: number,
    empresaConfig: EmpresaConfig
  ): Promise<DerivacaoDB[]> {
    try {
      await inicializarDataSource(empresaConfig);
      const dataSource = getAppDataSource();
      const repository = dataSource.getRepository(Derivacao);

      const derivacoes = await repository.find({
        where: {
          COD_EMPRESA: codEmpresa,
          COD_PRODUTO: codProduto,
        },
        order: {
          COD_DERIVACAO: "ASC",
        },
      });

      return derivacoes.map((d) => ({
      COD_EMPRESA: d.COD_EMPRESA,
      COD_PRODUTO: d.COD_PRODUTO,
      COD_DERIVACAO: d.COD_DERIVACAO,
      DES_DERIVACAO: d.DES_DERIVACAO,
      COD_BARRA: d.COD_BARRA,
      SIT_DERIVACAO: d.SIT_DERIVACAO,
      OBS_DERIVACAO: d.OBS_DERIVACAO,
      DAT_CADASTRO: null,
      DAT_ALTERACAO: null,
      COD_USUARIO: null,
      }));
    } catch (erro) {
      logger.warn("Erro ao listar derivações com TypeORM, usando SQL raw", {
        codEmpresa,
        codProduto,
        erro: erro instanceof Error ? erro.message : String(erro),
      });

      const query = `
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
        ORDER BY COD_DERIVACAO
      `;

      return poolBanco.executarConsulta<DerivacaoDB>(
        query,
        { codEmpresa, codProduto },
        empresaConfig
      );
    }
  }

  async listarEstoques(
    codEmpresa: number,
    codProduto: number,
    empresaConfig: EmpresaConfig
  ): Promise<EstoqueDB[]> {
    try {
      await inicializarDataSource(empresaConfig);
      const dataSource = getAppDataSource();
      const repository = dataSource.getRepository(Estoque);

      const estoques = await repository.find({
        where: {
          COD_EMPRESA: codEmpresa,
          COD_PRODUTO: codProduto,
        },
        order: {
          COD_DEPOSITO: "ASC",
          COD_DERIVACAO: "ASC",
        },
      });

      return estoques.map((e) => ({
        COD_EMPRESA: e.COD_EMPRESA,
        COD_PRODUTO: e.COD_PRODUTO,
        COD_DEPOSITO: e.COD_DEPOSITO,
        COD_DERIVACAO: e.COD_DERIVACAO,
        QTD_ATUAL: e.QTD_ATUAL,
        QTD_RESERVADA: e.QTD_RESERVADA,
        ACE_ESTOQUE_NEGATIVO: e.ACE_ESTOQUE_NEGATIVO,
        DAT_ALTERACAO: null,
        COD_USUARIO: null,
      }));
    } catch (erro) {
      logger.warn("Erro ao listar estoques com TypeORM, usando SQL raw", {
        codEmpresa,
        codProduto,
        erro: erro instanceof Error ? erro.message : String(erro),
      });

      const query = `
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
        ORDER BY COD_DEPOSITO, COD_DERIVACAO
      `;

      return poolBanco.executarConsulta<EstoqueDB>(
        query,
        { codEmpresa, codProduto },
        empresaConfig
      );
    }
  }

  private mapearParaDB(produto: ProdutoServico): ProdutoServicoDB {
    return {
      COD_EMPRESA: produto.COD_EMPRESA,
      COD_PRODUTO: produto.COD_PRODUTO,
      DES_PRODUTO: produto.DES_PRODUTO,
      COD_UNIDADE_MEDIDA: produto.COD_UNIDADE_MEDIDA,
      IND_PRODUTO_SERVICO: produto.IND_PRODUTO_SERVICO,
      SIT_PRODUTO: produto.SIT_PRODUTO,
      OBS_PRODUTO: produto.OBS_PRODUTO,
      DAT_CADASTRO: produto.DAT_CADASTRO,
      DAT_ALTERACAO: produto.DAT_ALTERACAO,
      COD_USUARIO: produto.COD_USUARIO,
    };
  }
}

export const produtoRepositoryORM = new ProdutoRepositoryORM();
