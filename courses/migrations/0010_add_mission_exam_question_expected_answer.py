from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("courses", "0009_add_mission_exam_question_type"),
    ]

    operations = [
        migrations.SeparateDatabaseAndState(
            database_operations=[
                migrations.AddField(
                    model_name="missionexamquestion",
                    name="expected_answer",
                    field=models.TextField(
                        blank=True,
                        default="",
                        help_text="Expected answer for open questions.",
                    ),
                ),
            ],
            state_operations=[],
        ),
    ]
