from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("courses", "0008_remove_exam_models"),
    ]

    operations = [
        migrations.SeparateDatabaseAndState(
            database_operations=[
                migrations.AddField(
                    model_name="missionexamquestion",
                    name="question_type",
                    field=models.CharField(
                        choices=[("closed", "Closed"), ("open", "Open")],
                        default="closed",
                        max_length=20,
                    ),
                ),
            ],
            state_operations=[],
        ),
    ]