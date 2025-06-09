<?php

namespace App\Entity\Enum;

enum CommunityRoleEnum: string
{
    case MEMBER = "member";
    case MODERATOR = "moderator";
    case ADMIN = "administrator";
}
