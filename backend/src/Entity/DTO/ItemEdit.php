<?php

namespace App\Entity\DTO;

use App\Entity\Item;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Serializer\Annotation\Groups;

class ItemEdit
{
    #[Groups(["item_edit"])]
    public ?string $title = null;

    #[Groups(["item_edit"])]
    public ?string $description = null;

    #[Groups(["item_edit"])]
    public ?string $image = null;

    #[Groups(["item_edit"])]
    public ?string $keywords = null;

    public function update(Item $item)
    {
        $item
            ->setTitle($this->title !== null && strlen($this->title) > 0 ? $this->title : $item->getTitle())
            ->setDescription($this->description !== null && strlen($this->description) > 0 ? $this->description : $item->getDescription())
            ->setKeywords($this->keywords !== null && strlen($this->keywords) > 0 ? explode(',', $this->keywords) : $item->getKeywords())
        ;
    }

    public function updateImage(Request $request, Item $item)
    {
        // Read image content
        $file = $request->files->get('image');
        if ($file !== null) { // Make sure an image was sent
            $stream = fopen($file->getPathname(), 'rb');
            // Set image
            $item->setImage(stream_get_contents($stream));
            fclose($stream);
        }
    }
}
