import { motion } from 'framer-motion';
import { Search, Edit3, Package } from 'lucide-react';
import {
  Card,
  CardHeader,
  CardContent,
  Table,
  Button,
  Badge,
} from '../../../components/ui';
import { formatCurrency, type ProdutoEmpresa } from '../../../lib/types';

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

interface ProdutosTableProps {
  produtos: ProdutoEmpresa[];
  categorias: string[];
  isLoading: boolean;
  searchQuery: string;
  selectedCategoria: string;
  onSearchChange: (query: string) => void;
  onCategoriaChange: (categoria: string) => void;
  onEditProduct: (produto: ProdutoEmpresa) => void;
}

export function ProdutosTable({
  produtos,
  categorias,
  isLoading,
  searchQuery,
  selectedCategoria,
  onSearchChange,
  onCategoriaChange,
  onEditProduct,
}: ProdutosTableProps) {
  const columns = [
    {
      key: 'codigo',
      header: 'Código',
      sortable: true,
      render: (p: ProdutoEmpresa) => (
        <span className="font-mono text-sm text-gold-500">
          {p.produto_referencia?.codigo}
        </span>
      ),
    },
    {
      key: 'nome',
      header: 'Produto',
      sortable: true,
      render: (p: ProdutoEmpresa) => (
        <div>
          <p className="font-heading text-parchment-100">
            {p.produto_referencia?.nome}
          </p>
          <p className="text-xs text-parchment-500">
            {p.produto_referencia?.categoria}
          </p>
        </div>
      ),
    },
    {
      key: 'preco_venda',
      header: 'Preço Venda',
      sortable: true,
      render: (p: ProdutoEmpresa) => (
        <span className="font-heading text-gold-500">
          {formatCurrency(p.preco_venda)}
        </span>
      ),
    },
    {
      key: 'preco_pagamento_funcionario',
      header: 'Pgto. Funcionário',
      sortable: true,
      render: (p: ProdutoEmpresa) => (
        <span className="text-parchment-300">
          {formatCurrency(p.preco_pagamento_funcionario)}
        </span>
      ),
    },
    {
      key: 'estoque_atual',
      header: 'Estoque',
      sortable: true,
      render: (p: ProdutoEmpresa) => (
        <Badge variant={p.estoque_atual > 0 ? 'gold' : 'danger'}>
          {p.estoque_atual} {p.produto_referencia?.unidade || 'un.'}
        </Badge>
      ),
    },
    {
      key: 'margem',
      header: 'Margem',
      render: (p: ProdutoEmpresa) => {
        const margem = p.preco_venda - p.preco_pagamento_funcionario;
        const percentual = ((margem / p.preco_venda) * 100).toFixed(0);
        return (
          <span className="text-sm text-parchment-400">
            {formatCurrency(margem)} ({percentual}%)
          </span>
        );
      },
    },
    {
      key: 'actions',
      header: '',
      width: '80px',
      render: (p: ProdutoEmpresa) => (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onEditProduct(p)}
          leftIcon={<Edit3 size={14} />}
        >
          Editar
        </Button>
      ),
    },
  ];

  return (
    <motion.div variants={item}>
      <Card>
        <CardHeader
          action={
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3 w-full sm:w-auto">
              <select
                value={selectedCategoria}
                onChange={(e) => onCategoriaChange(e.target.value)}
                className="select-western py-2 text-sm w-full sm:w-48"
              >
                <option value="">Todas as Categorias</option>
                {categorias.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>

              <div className="relative flex-1 sm:flex-none">
                <Search
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-leather-500"
                />
                <input
                  type="text"
                  placeholder="Buscar produto..."
                  value={searchQuery}
                  onChange={(e) => onSearchChange(e.target.value)}
                  className="input-western pl-9 py-2 text-sm w-full sm:w-64"
                />
              </div>
            </div>
          }
        >
          <h2 className="font-heading text-lg text-parchment-100">
            Catálogo de Produtos
          </h2>
        </CardHeader>

        <CardContent className="p-0">
          <Table
            data={produtos}
            columns={columns}
            keyExtractor={(p) => p.id}
            isLoading={isLoading}
            emptyMessage="Nenhum produto encontrado"
            emptyIcon={<Package className="w-12 h-12" />}
            emptyHint="Use !configprecos no Discord para cadastrar produtos"
            mobileCardRender={(p) => (
              <div
                className="flex items-center gap-3 p-4 hover:bg-leather-800/30 transition-colors"
                onClick={() => onEditProduct(p)}
              >
                <div className="flex-1 min-w-0">
                  <p className="font-heading text-sm text-parchment-100 truncate">
                    {p.produto_referencia?.nome}
                  </p>
                  <p className="text-xs text-parchment-500 font-mono">{p.produto_referencia?.codigo}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="font-heading text-sm text-gold-500">{formatCurrency(p.preco_venda)}</p>
                  <Badge variant={p.estoque_atual > 0 ? 'gold' : 'danger'} className="mt-1">
                    {p.estoque_atual} {p.produto_referencia?.unidade || 'un.'}
                  </Badge>
                </div>
              </div>
            )}
          />
        </CardContent>
      </Card>
    </motion.div>
  );
}
