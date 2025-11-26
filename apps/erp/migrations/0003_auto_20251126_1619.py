from django.db import migrations

def migrate_services(apps, schema_editor):
    Produto = apps.get_model('erp', 'Produto')
    Servico = apps.get_model('erp', 'Servico')
    ItemVenda = apps.get_model('vendas', 'ItemVenda')
    
    # Migrate Products of type 'servico'
    for produto in Produto.objects.filter(tipo='servico'):
        # Check if service with this code already exists (to avoid duplicates if run multiple times)
        if Servico.objects.filter(codigo_interno=produto.codigo_interno).exists():
            continue
            
        # Create Servico
        servico = Servico.objects.create(
            nome=produto.nome,
            descricao=produto.descricao,
            categoria=produto.categoria,
            codigo_interno=produto.codigo_interno,
            preco_custo=produto.preco_custo,
            preco_venda=produto.preco_venda,
            margem_lucro=produto.margem_lucro,
        )
        
        # Update ItemVenda
        items = ItemVenda.objects.filter(produto=produto)
        for item in items:
            item.servico = servico
            item.produto = None
            item.save()
            
        # Deactivate old product
        produto.active = False
        produto.save()

class Migration(migrations.Migration):

    dependencies = [
        ('erp', '0002_servico'),
        ('vendas', '0003_alter_itemvenda_options_itemvenda_servico_and_more'),
    ]

    operations = [
        migrations.RunPython(migrate_services),
    ]
