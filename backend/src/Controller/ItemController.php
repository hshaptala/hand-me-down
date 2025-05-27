<?php

namespace App\Controller;

use App\Entity\Community;
use App\Entity\DTO\ItemNew;
use App\Entity\Enum\ItemStatusEnum;
use App\Entity\Item;
use App\Entity\User;
use App\Repository\ItemRepository;
use Doctrine\ORM\EntityManagerInterface;
use FOS\RestBundle\Controller\Annotations\View;
use Nelmio\ApiDocBundle\Attribute\Model;
use Nelmio\ApiDocBundle\Attribute\Security;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;
use OpenApi\Attributes as OA;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpKernel\Attribute\MapRequestPayload;
use Symfony\Component\HttpKernel\Exception\HttpException;
use Symfony\Component\Routing\Generator\UrlGeneratorInterface;
use Symfony\Component\Security\Http\Attribute\CurrentUser;
use Symfony\Component\Security\Http\Attribute\IsGranted;

#[Route('/api')]
final class ItemController extends AbstractController
{
   
    // List

    #[View(serializerGroups: ["item_basic"])]
    #[Route(path:"/communities/{id}/items", methods: ["GET"])]
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
                content: new OA\JsonContent( type: 'array', items: new OA\Items(ref: new Model(type: Item::class, groups: ['item_basic'])))
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
    public function members(
        Community $community,
        ItemRepository $itemRepository,
        UrlGeneratorInterface $urlGen
    )
    {
        $items = $itemRepository->findByCommunity($community);
        
        /* Generate image urls
        foreach ($members as $member) {
            if($member->getUser()->getAvatar() === null){
                $member->getUser()
                    ->setAvatarUrl($urlGen->generate('api_default_avatar'))
                ;
            }else{
                $member->getUser()
                    ->setAvatarUrl($urlGen->generate('api_user_avatar', ['id' => $member->getUser()->getId()]))
                ;
            }
        };*/

        return $items;
    }




    // NEW




    #[View(serializerGroups: ["item_basic"])]
    #[Route(path:"/api/communities/{id}/items", methods: ["POST"], name:"api_items_new")]
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
                    required: ['title', 'description'],
                    properties: [
                        new OA\Property(property: 'title', type: 'string', description: 'Post title'),
                        new OA\Property(property: 'description', type: 'string', description: 'A brief description of your item', example: 'An amazing item'),
                        new OA\Property(property: 'keywords', type: 'array', description: 'List of keywords matching your item', items: new OA\Items(type:'string')),
                        //new OA\Property(property: 'image', type: 'string', format: 'binary', description: 'Image upload')
                    ]
                )
            )
        ),
        responses: [
            new OA\Response(
                response: 200,
                description: 'Item created successfully',
                content: new OA\JsonContent(ref: new Model(type: Item::class, groups: ['item_basic']))
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

        /* Read image content
        $file = $request->files->get('image');
        if ($file === null) { // Make sure an image was sent
            return new JsonResponse(['error' => 'No file provided'], 400);
        }
        $stream = fopen($file->getPathname(), 'rb');*/


        // Keywords
        $keywords = $request->request->all('keywords');

        var_dump($keywords);
        die();

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
            //->setImage(stream_get_contents($stream))
        ;

        // Close image and saves entities
        //fclose($stream);
        $em->persist($item);
        $em ->flush();

        /* Set values for return
        $item
            ->setImageUrl($urlGen->generate('api_communities_image', ['id' => $item->getId()]))
        ;*/

        // Return new community
        return $item;
    }
}
