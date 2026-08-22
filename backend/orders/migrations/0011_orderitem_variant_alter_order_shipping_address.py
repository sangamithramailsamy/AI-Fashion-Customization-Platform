from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ("catalog", "0009_remove_design_collection_category"),
        ("orders", "0010_orderitem_product_image_orderitem_product_name"),
        (
            "shopping",
            "0005_alter_cart_options_alter_cartitem_options_and_more",
        ),
    ]

    operations = [
        # Add the new variant relationship
        migrations.AddField(
            model_name="orderitem",
            name="variant",
            field=models.ForeignKey(
                blank=True,
                null=True,
                on_delete=django.db.models.deletion.SET_NULL,
                related_name="order_items",
                to="catalog.designvariant",
            ),
        ),

        # Remove the old JSON shipping address field
        migrations.RemoveField(
            model_name="order",
            name="shipping_address",
        ),

        # Create the new ForeignKey shipping address field
        migrations.AddField(
            model_name="order",
            name="shipping_address",
            field=models.ForeignKey(
                blank=True,
                null=True,
                on_delete=django.db.models.deletion.SET_NULL,
                related_name="orders",
                to="shopping.shippingaddress",
            ),
        ),
    ]