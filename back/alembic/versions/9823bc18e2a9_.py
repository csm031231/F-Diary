"""empty message

Revision ID: 9823bc18e2a9
Revises: 95b9d7e0ac10
Create Date: 2025-05-25 03:00:48.543424

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '9823bc18e2a9'
down_revision: Union[str, None] = '95b9d7e0ac10'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    # ### commands auto generated by Alembic - please adjust! ###
    op.add_column('diaries', sa.Column('emotion_tag', sa.String(), nullable=True))
    # ### end Alembic commands ###


def downgrade() -> None:
    """Downgrade schema."""
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_column('diaries', 'emotion_tag')
    # ### end Alembic commands ###
