<?php

namespace App\Entity\Enum;

enum ItemStatusEnum: string
{
    case OPEN = "Open";
    case RESERVED = "Reserved";
    case OVER = "Over";
}