#!/bin/bash

# 🧹 Limpeza de Arquivos Desnecessários
# Este script remove arquivos e pastas que não são essenciais para o projeto

echo "🧹 Iniciando limpeza do projeto..."

# ==================== BACKEND CLEANUP ====================
cd gabrielly-backend

echo "📦 Backend - Limpando..."

# Remover node_modules se duplicado
if [ -d "node_modules" ]; then
    echo "  • Removendo node_modules..."
    rm -rf node_modules
fi

# Remover package-lock.json para regenerar
# Comentado - descomente se quiser
# rm -f package-lock.json

# Limpar arquivos de teste antigos
rm -f jest.log
rm -f coverage.log

# Remover arquivos temporários
rm -rf .env.local
rm -rf .env.test.local
rm -rf dist/
rm -rf tmp/
rm -rf temp/

echo "  ✅ Backend limpo"

# Voltar para raiz
cd ..

# ==================== FRONTEND CLEANUP ====================
cd gabrielly-frontend

echo "📦 Frontend - Limpando..."

# Remover node_modules
if [ -d "node_modules" ]; then
    echo "  • Removendo node_modules..."
    rm -rf node_modules
fi

# Remover build antigos
rm -rf build/
rm -rf dist/

# Remover cache do React
rm -rf .cache/
rm -rf .eslintcache

# Remover arquivos temporários
rm -f .env.local
rm -f .env.test.local
rm -rf tmp/
rm -rf temp/

echo "  ✅ Frontend limpo"

# Voltar para raiz
cd ..

# ==================== ROOT CLEANUP ====================
echo "🗑️  Raiz do projeto - Limpando..."

# Remover arquivos de log
rm -f *.log
rm -f npm-debug.log*
rm -f yarn-debug.log*
rm -f yarn-error.log*

# Remover arquivos de cache
rm -rf .DS_Store
rm -rf Thumbs.db

echo "  ✅ Raiz do projeto limpo"

# ==================== RESUMO ====================
echo ""
echo "════════════════════════════════════════"
echo "✅ Limpeza concluída com sucesso!"
echo "════════════════════════════════════════"
echo ""
echo "Próximos passos:"
echo "1. npm install (em gabrielly-backend)"
echo "2. npm install (em gabrielly-frontend)"
echo "3. npm start"
echo ""
