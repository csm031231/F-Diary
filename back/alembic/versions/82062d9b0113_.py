"""empty message

Revision ID: 82062d9b0113
Revises: 9319385f7d4a
Create Date: 2025-05-04 22:10:40.014666

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = '82062d9b0113'
down_revision: Union[str, None] = '9319385f7d4a'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    # ### commands auto generated by Alembic - please adjust! ###
    op.add_column('diaries', sa.Column('feedback', sa.Text(), nullable=True))
    op.drop_column('diaries', 'keywords')
    op.drop_column('diaries', 'emotion')
    # ### end Alembic commands ###


def downgrade() -> None:
    """Downgrade schema."""
    # ### commands auto generated by Alembic - please adjust! ###
    op.add_column('diaries', sa.Column('emotion', sa.VARCHAR(length=50), autoincrement=False, nullable=True))
    op.add_column('diaries', sa.Column('keywords', postgresql.ARRAY(sa.VARCHAR()), autoincrement=False, nullable=True))
    op.drop_column('diaries', 'feedback')
    # ### end Alembic commands ###
