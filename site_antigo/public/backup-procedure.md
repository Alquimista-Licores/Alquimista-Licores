# Procedimento de Backup e Restauração JSON

Este documento descreve como garantir que o backup e a restauração de dados via JSON funcionem corretamente, evitando problemas de codificação e formato.

## 1. Exportação (Backup)
- O sistema gera um arquivo `.json` codificado em **UTF-8**.
- O arquivo contém poções, kits, depoimentos e configurações de destaque.
- **Dica:** Não altere a extensão do arquivo manualmente.

## 2. Importação (Restauração)
- O sistema aceita apenas arquivos `.json` válidos.
- A importação utiliza `TextDecoder("utf-8")` para garantir que caracteres especiais (acentos, emojis) sejam lidos corretamente, independente do sistema operacional de origem.
- **Atenção:** A restauração é destrutiva. Ela limpa as tabelas atuais antes de inserir os dados do backup.

## 3. Resolução de Problemas
- **Erro de Codificação:** Se o arquivo foi editado em um editor que alterou o encoding (ex: salvo em ANSI ou UTF-16), a importação pode falhar. Certifique-se de salvar como **UTF-8**.
- **Erro de Formato:** O arquivo deve conter o campo `"version": 1`. Se este campo estiver ausente ou for diferente, a restauração será bloqueada por segurança.
- **Caracteres Estranhos:** Se nomes de produtos aparecerem com símbolos (ex: `Poo`), verifique se o arquivo original foi corrompido ou salvo sem BOM (Byte Order Mark). O sistema atual está configurado para tratar UTF-8 sem BOM como padrão.

## 4. Estrutura Esperada
```json
{
  "version": 1,
  "exported_at": "ISO-DATE",
  "products": [...],
  "kit_prices": [...],
  "testimonials": [...],
  "featured_config": [...]
}
```
