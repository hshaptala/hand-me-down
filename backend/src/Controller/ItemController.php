<?php

namespace App\Controller;

use App\Entity\Community;
use App\Entity\DTO\ItemEdit;
use App\Entity\DTO\ItemNew;
use App\Entity\Enum\ItemStatusEnum;
use App\Entity\Item;
use App\Entity\User;
use App\Repository\ItemRepository;
use App\Service\ItemService;
use Doctrine\ORM\EntityManager;
use Doctrine\ORM\EntityManagerInterface;
use FOS\RestBundle\Controller\Annotations\View;
use Nelmio\ApiDocBundle\Attribute\Model;
use Nelmio\ApiDocBundle\Attribute\Security;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;
use OpenApi\Attributes as OA;
use Symfony\Bridge\Doctrine\Attribute\MapEntity;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpKernel\Attribute\MapRequestPayload;
use Symfony\Component\HttpKernel\Exception\HttpException;
use Symfony\Component\Routing\Generator\UrlGeneratorInterface;
use Symfony\Component\Security\Http\Attribute\CurrentUser;
use Symfony\Component\Security\Http\Attribute\IsGranted;


final class ItemController extends AbstractController
{
   
    // LIST

    #[View(serializerGroups: ["item_basic"])]
    #[Route(path:"/api/communities/{id}/items", methods: ["GET"])]
    #[IsGranted("ROLE_USER")]
    #[IsGranted('COMMUNITY_VIEW', subject: 'community')]
    #[Security(name:"Bearer")]
    #[OA\Get(
        summary: "Get all the items of a community.",
        tags: ["Items"],
        responses: [
            new OA\Response(
                response: 200,
                description: 'List of items',
                content: new OA\JsonContent( type: 'array', items: new OA\Items(ref: "#/components/schemas/Item"))
            ),
            new OA\Response(
                response: 401,
                description: 'Full authentication is required to access this resource.',
            ),
            new OA\Response(
                response: 403,
                description: 'Permission denied.',
            ),
            new OA\Response(
                response: 404,
                description: 'Community not found',
            ),
        ]
    )] 
    public function items(
        Community $community,
        ItemRepository $itemRepository,
        UrlGeneratorInterface $urlGen
    )
    {
        $items = $itemRepository->findByCommunity($community);
        
        // Generate image urls
        foreach ($items as $item) {
            $item
                ->setImageUrl($urlGen->generate('api_items_image', ['id' => $item->getId()]))
            ;
        };

        return $items;
    }



    // GET 


    #[View(serializerGroups: ["item_basic"])]
    #[Route(path:"/api/communities/{communityId}/items/{itemId}", methods: ["GET"])]
    #[IsGranted("ROLE_USER")]
    #[IsGranted('COMMUNITY_VIEW', subject: 'community')]
    #[Security(name:"Bearer")]
    #[OA\Get(
        summary: "Get the information about an item.",
        tags: ["Items"],
        responses: [
            new OA\Response(
                response: 200,
                description: 'Item object',
                content: new OA\JsonContent(ref: "#/components/schemas/Item")
            ),
            new OA\Response(
                response: 401,
                description: 'Full authentication is required to access this resource.',
            ),
            new OA\Response(
                response: 403,
                description: 'Permission denied.',
            ),
            new OA\Response(
                response: 404,
                description: 'Community not found',
            ),
        ]
    )] 
    public function item(
        #[MapEntity(id: 'communityId')] Community $community,
        #[MapEntity(id: 'itemId')] Item $item,
        UrlGeneratorInterface $urlGen
    )
    {
        // Generate imageUrl
        $item
            ->setImageUrl($urlGen->generate('api_items_image', ['id' => $item->getId()]))
        ;
        return $item;
    }




    // NEW




    #[View(serializerGroups: ["item_basic"])]
    #[Route(path:"/api/communities/{id}/items", methods: ["POST"])]
    #[IsGranted("ROLE_USER")]
    #[Security(name:"Bearer")]
    #[IsGranted('COMMUNITY_VIEW', subject: 'community')]
    #[OA\Post(
        tags: ['Items'],
        summary: 'Post a new item in a community',
        requestBody: new OA\RequestBody(
            required: true,
            content: new OA\MediaType(
                mediaType: 'multipart/form-data',
                schema: new OA\Schema(
                    type: 'object',
                    required: ['title', 'description', 'image'],
                    properties: [
                        new OA\Property(property: 'title', type: 'string', description: 'Post title'),
                        new OA\Property(property: 'description', type: 'string', description: 'A brief description of your item', example: 'An amazing item'),
                        new OA\Property(property: 'keywords', type: 'array', description: 'List of keywords matching your item', items: new OA\Items(type:'string')),
                        new OA\Property(property: 'image', type: 'string', format: 'binary', description: 'Image upload')
                    ]
                )
            )
        ),
        responses: [
            new OA\Response(
                response: 200,
                description: 'Item created successfully',
                content: new OA\JsonContent(ref: "#/components/schemas/Item")
            ),
            new OA\Response(
                response: 400,
                description: 'No file provided',
            ),
            new OA\Response(
                response: 401,
                description: 'Full authentication is required to access this resource.',
            ),
            new OA\Response(
                response: 403,
                description: 'Permission denied.',
            ),
            new OA\Response(
                response: 404,
                description: 'Community not found',
            ),
        ]
    )]
    public function new (
        Community $community,
        Request $request,
        #[MapRequestPayload(serializationContext: ["groups" => ["item_new"]])] ItemNew $dto,
        EntityManagerInterface $em,
        UrlGeneratorInterface $urlGen,
        #[CurrentUser()] User $user
    )
    {
        // Check User
        if ($user === null){ 
           throw new HttpException(Response::HTTP_UNAUTHORIZED, "Full authentication is required to access this resource."); 
        }

        // Read image content
        $file = $request->files->get('image');
        if ($file === null) { // Make sure an image was sent
            return new JsonResponse(['error' => 'No file provided'], 400);
        }
        $stream = fopen($file->getPathname(), 'rb');


        // Keywords
        $keywords = $request->request->get('keywords');
        $keywords = explode(',', $keywords);

        // Create new entity
        $item = new Item();
        $item
            ->setCommunity($community)        
            ->setDonor($user)
            ->setPostedAt(new \DateTimeImmutable())
            ->setTitle($dto->title)
            ->setDescription($dto->description)
            ->setStatus(ItemStatusEnum::OPEN)
            ->setKeywords($keywords)
            ->setImage(stream_get_contents($stream))
        ;

        // Close image and saves entities
        fclose($stream);
        $em->persist($item);
        $em ->flush();

        //Set values for return
        $item
            ->setImageUrl($urlGen->generate('api_items_image', ['id' => $item->getId()]))
        ;

        // Return new community
        return $item;
    }



    // IMAGE


    #[Route(path:'/images/items/{id}.png', methods: ['GET'], name:"api_items_image")]
    public function getImageUrl(int $id, ItemRepository $itemRepository)
    {
        // Get item's image
        $item = $itemRepository->find($id);
        $imageContent = $item->getImage();

        // Return image
        return new Response(stream_get_contents($imageContent), 200, [
            'Content-Type' => 'image/png',
            'Content-Disposition' => 'inline; filename="'. $item->getTitle() .'.png"',
        ]);
    }



    // DELETE 


    #[View(serializerGroups: ["item_basic"])]
    #[Route(path:"/api/communities/{communityId}/items/{itemId}", methods: ["DELETE"])]
    #[IsGranted("ROLE_USER")]
    #[IsGranted('COMMUNITY_VIEW', subject: 'community')]
    #[Security(name:"Bearer")]
    #[OA\Delete(
        summary: "Delete an item.",
        tags: ["Items"],
        responses: [
            new OA\Response(
                response: 200,
                description: 'Item successfully deleted',
            ),
            new OA\Response(
                response: 401,
                description: 'Full authentication is required to access this resource.',
            ),
            new OA\Response(
                response: 403,
                description: 'Permission denied.',
            ),
            new OA\Response(
                response: 404,
                description: 'Community not found',
            ),
        ]
    )] 
    public function delete(
        #[MapEntity(id: 'communityId')] Community $community,
        #[MapEntity(id: 'itemId')] Item $item,
        #[CurrentUser()] User $user,
        EntityManagerInterface $em
    )
    {
        if($item->getDonor() !== $user){
            return new JsonResponse("You do not have permission to delete this item.",403);
        }
        $em->remove($item);
        $em->flush();
        return new JsonResponse("Successfully deleted item",200);
    }


    // EDIT






    #[View(serializerGroups: ["item_basic"])]
    #[Route(path:"/api/communities/{communityId}/items/{itemId}", methods: ["PATCH", "POST"])]
    #[IsGranted("ROLE_USER")]
    #[IsGranted('COMMUNITY_VIEW', subject: 'community')]
    #[Security(name:"Bearer")]
    #[OA\Post(
        tags: ['Items'],
        summary: 'Update an item informations',
        requestBody: new OA\RequestBody(
            required: false,
            content: new OA\MediaType(
                mediaType: 'multipart/form-data',
                schema: new OA\Schema(
                    type: 'object',
                    properties: [
                        new OA\Property(property: 'title', type: 'string', description: 'Post title'),
                        new OA\Property(property: 'description', type: 'string', description: 'A brief description of your item'),
                        new OA\Property(property: 'keywords', type: 'array', description: 'List of keywords matching your item', items: new OA\Items(type:'string')),
                        new OA\Property(property: 'image', type: 'string', format: 'binary', description: 'Image upload')
                    ]
                )
            )
        ),
        responses: [
            new OA\Response(
                response: 200,
                description: 'Item updated successfully',
                content: new OA\JsonContent(ref: "#/components/schemas/Item")
            ),
            new OA\Response(
                response: 401,
                description: 'Full authentication is required to access this resource.',
            ),
            new OA\Response(
                response: 403,
                description: 'Permission denied.',
            ),
            new OA\Response(
                response: 404,
                description: 'Item not found',
            ),
        ]
    )]    
    public function edit(
        #[MapEntity(id: 'communityId')] Community $community,
        #[MapEntity(id: 'itemId')] Item $item,
        Request $request,
        EntityManagerInterface $em,
        #[CurrentUser()] User $user,
        UrlGeneratorInterface $urlGen,
    )
    {
        // Check User
        if ($user === null){ 
           return throw new HttpException(Response::HTTP_UNAUTHORIZED, "Full authentication is required to access this resource."); 
        }

        // Check permission
        if($item->getDonor() !== $user){
            return new JsonResponse("You do not have permission to edit this item.",403);
        }

        // Manually populate DTO 
        $dto = new ItemEdit();
        $dto->title = $request->request->get('title');
        $dto->description = $request->request->get('description');
        $dto->keywords = $request->request->get('keywords');

        // Edit
        $dto->update($item);
        $dto->updateImage($request, $item);

        // Save
        $em->persist($item);
        $em->flush();

        // Set values for return
        $item
            ->setImageUrl($urlGen->generate('api_items_image', ['id' => $item->getId()]))
        ;

        return $item;
    }


    // Reservations


    #[View()]
    #[Route(path:"/api/communities/{communityId}/items/{itemId}/reserve", methods: ["POST"])]
    #[IsGranted("ROLE_USER")]
    #[IsGranted('COMMUNITY_VIEW', subject: 'community')]
    #[Security(name:"Bearer")]
    #[OA\Post(
        tags: ['Items'],
        summary: 'Reserve an Item',
        responses: [
            new OA\Response(
                response: 200,
                description: 'Item reserved successfuly'
            ),
            new OA\Response(
                response: 401,
                description: 'Full authentication is required to access this resource.',
            ),
            new OA\Response(
                response: 403,
                description: 'Permission denied.',
            ),
            new OA\Response(
                response: 404,
                description: 'Item not found',
            ),
            new OA\Response(
                response: 409,
                description: 'You cannot reserve your own item or one that is already reserved.',
            ),
        ]
    )]    
    public function reserve(
        #[MapEntity(id: 'communityId')] Community $community,
        #[MapEntity(id: 'itemId')] Item $item,
        #[CurrentUser()] User $user,
        ItemService $itemService
    )
    {
        $itemService->reserve($user, $item);
        return new JsonResponse("Item reserved successfuly",200);
    }
}
