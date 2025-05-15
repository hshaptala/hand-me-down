<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20250515141028 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql(<<<'SQL'
            CREATE TABLE community (id SERIAL NOT NULL, name VARCHAR(255) NOT NULL, type VARCHAR(50) NOT NULL, location VARCHAR(255) NOT NULL, description TEXT DEFAULT NULL, image_url VARCHAR(255) DEFAULT NULL, password VARCHAR(255) DEFAULT NULL, created_at TIMESTAMP(0) WITHOUT TIME ZONE DEFAULT NULL, PRIMARY KEY(id))
        SQL);
        $this->addSql(<<<'SQL'
            COMMENT ON COLUMN community.created_at IS '(DC2Type:datetime_immutable)'
        SQL);
        $this->addSql(<<<'SQL'
            CREATE TABLE item (id SERIAL NOT NULL, community_id INT NOT NULL, title VARCHAR(255) NOT NULL, description TEXT DEFAULT NULL, image_url VARCHAR(255) DEFAULT NULL, category VARCHAR(100) NOT NULL, status VARCHAR(50) NOT NULL, created_at TIMESTAMP(0) WITHOUT TIME ZONE NOT NULL, PRIMARY KEY(id))
        SQL);
        $this->addSql(<<<'SQL'
            CREATE INDEX IDX_1F1B251EFDA7B0BF ON item (community_id)
        SQL);
        $this->addSql(<<<'SQL'
            COMMENT ON COLUMN item.created_at IS '(DC2Type:datetime_immutable)'
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE item ADD CONSTRAINT FK_1F1B251EFDA7B0BF FOREIGN KEY (community_id) REFERENCES community (id) NOT DEFERRABLE INITIALLY IMMEDIATE
        SQL);
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql(<<<'SQL'
            ALTER TABLE item DROP CONSTRAINT FK_1F1B251EFDA7B0BF
        SQL);
        $this->addSql(<<<'SQL'
            DROP TABLE community
        SQL);
        $this->addSql(<<<'SQL'
            DROP TABLE item
        SQL);
    }
}
