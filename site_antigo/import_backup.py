import json
import os
import sys

def run_sql(sql):
    # Using psql since it was available in the previous turn
    import subprocess
    process = subprocess.Popen(['psql', '-c', sql], stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
    stdout, stderr = process.communicate()
    if process.returncode != 0:
        print(f"SQL Error: {stderr}")
    return stdout

def escape_sql(val):
    if val is None:
        return 'NULL'
    if isinstance(val, str):
        return "'" + val.replace("'", "''") + "'"
    if isinstance(val, bool):
        return 'true' if val else 'false'
    if isinstance(val, (int, float)):
        return str(val)
    if isinstance(val, list) or isinstance(val, dict):
        return "'" + json.dumps(val).replace("'", "''") + "'"
    return str(val)

try:
    with open('/mnt/user-uploads/alquimista-backup-2026-08-04-2.json', 'r') as f:
        data = json.load(f)

    # Disable RLS temporarily or use service role privileges if possible, 
    # but here we just insert. Since I am 'admin' in the sandbox psql, I might have bypass rl.
    
    print("Cleaning up existing data...")
    run_sql("TRUNCATE products, testimonials, kit_prices, featured_config CASCADE;")

    print(f"Importing {len(data['products'])} products...")
    for p in data['products']:
        # Map fields from backup to database
        # Backup has 'graduacao_gl', DB has 'graduacao' (text)
        # Backup has 'brix' (int/float), DB has 'brix' (text)
        # Backup has 'fotos' (array of objects), DB has 'fotos' (jsonb)
        sql = f"""
        INSERT INTO products (id, nome, sabor, descricao, estoque, preco, categoria, graduacao, brix, fotos, ativo, pedidos_count, created_at)
        VALUES (
            {escape_sql(p.get('id'))},
            {escape_sql(p.get('nome'))},
            {escape_sql(p.get('sabor'))},
            {escape_sql(p.get('descricao'))},
            {escape_sql(p.get('estoque', 0))},
            {escape_sql(p.get('preco'))},
            {escape_sql(p.get('categoria'))},
            {escape_sql(str(p.get('graduacao_gl', '')))},
            {escape_sql(str(p.get('brix', '')))},
            {escape_sql(p.get('fotos', []))},
            {escape_sql(p.get('ativo', True))},
            {escape_sql(p.get('pedidos_count', 0))},
            {escape_sql(p.get('created_at'))}
        );
        """
        run_sql(sql)

    print(f"Importing {len(data['testimonials'])} testimonials...")
    for t in data['testimonials']:
        sql = f"""
        INSERT INTO testimonials (id, nome, texto, ativo, created_at)
        VALUES (
            {escape_sql(t.get('id'))},
            {escape_sql(t.get('nome'))},
            {escape_sql(t.get('texto'))},
            {escape_sql(t.get('ativo', True))},
            {escape_sql(t.get('created_at'))}
        );
        """
        run_sql(sql)

    print(f"Importing {len(data['kit_prices'])} kit prices...")
    for k in data['kit_prices']:
        sql = f"""
        INSERT INTO kit_prices (id, kit_type, licor_categoria, embalagem, preco, created_at)
        VALUES (
            {escape_sql(k.get('id'))},
            {escape_sql(k.get('kit_type'))},
            {escape_sql(k.get('licor_categoria'))},
            {escape_sql(k.get('embalagem'))},
            {escape_sql(k.get('preco'))},
            {escape_sql(k.get('created_at', 'now()'))}
        );
        """
        run_sql(sql)

    if 'featured_config' in data:
        print("Importing featured config...")
        for f_cfg in data['featured_config']:
            # produto_ids in backup is list, DB is text[]
            p_ids = "{" + ",".join(f_cfg.get('produto_ids', [])) + "}"
            sql = f"""
            INSERT INTO featured_config (id, modo, produto_ids)
            VALUES (
                {escape_sql(f_cfg.get('id'))},
                {escape_sql(f_cfg.get('modo'))},
                {escape_sql(p_ids)}
            );
            """
            run_sql(sql)

    print("Import complete!")

except Exception as e:
    print(f"Error: {e}")
    sys.exit(1)
