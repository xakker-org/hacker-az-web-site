from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("courses", "0010_add_mission_exam_question_expected_answer"),
    ]

    operations = [
        migrations.AddField(
            model_name="missionexamanswer",
            name="submitted_answer",
            field=models.TextField(blank=True, default=""),
        ),
    ]