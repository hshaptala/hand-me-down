<?php

namespace App\Controller;

use App\Entity\Community;
use App\Entity\DTO\CommunityJoin;
use App\Entity\DTO\CommunityNew;
use App\Entity\Enum\CommunityRoleEnum;
use App\Entity\Enum\VisibilityEnum;
use App\Entity\Member;
use App\Entity\User;
use App\Repository\CommunityRepository;
use App\Service\CommunityService;
use Doctrine\ORM\EntityManagerInterface;
use Dom\Comment;
use FOS\RestBundle\Controller\Annotations\View;
use Nelmio\ApiDocBundle\Attribute\Model;
use Nelmio\ApiDocBundle\Attribute\Security;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\Config\Definition\Exception\ForbiddenOverwriteException;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpKernel\Exception\ConflictHttpException;
use Symfony\Component\Routing\Attribute\Route;
use OpenApi\Attributes as OA;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpKernel\Attribute\MapRequestPayload;
use Symfony\Component\HttpKernel\Exception\AccessDeniedHttpException;
use Symfony\Component\HttpKernel\Exception\BadRequestHttpException;
use Symfony\Component\HttpKernel\Exception\HttpException;
use Symfony\Component\HttpKernel\Exception\UnprocessableEntityHttpException;
use Symfony\Component\Security\Http\Attribute\IsGranted;
use Symfony\Component\Serializer\Normalizer\DenormalizerInterface;
use Symfony\Component\PasswordHasher\Hasher\PasswordHasherFactoryInterface;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;
use Symfony\Component\PasswordHasher\PasswordHasherInterface;
use Symfony\Component\Routing\Generator\UrlGeneratorInterface;
use Symfony\Component\Security\Http\Attribute\CurrentUser;
use Symfony\Component\Validator\Validator\ValidatorInterface;

final class CommunityController extends AbstractController
{


    // LIST


    #[View(serializerGroups: ["community_basic"])]
    #[Route(path:"/api/communities", methods: ["GET"])]
    #[OA\Get(
        summary: "Get the list of all communities and their basic info.",
        tags: ["Community"],
        responses: [
            new OA\Response(
                response: 200,
                description: 'List of communities',
                content: new OA\JsonContent( type: 'array', items: new OA\Items(ref: new Model(type: Community::class, groups: ['community_basic'])))
            )
        ]
    )]
    public function communities(CommunityRepository $communityRepository, UrlGeneratorInterface $urlGen)
    {
        $communities = $communityRepository->findAll();
        foreach ($communities as $community) {
            $community
                ->setImageUrl($urlGen->generate('api_communities_image', ['id' => $community->getId()]))
                ->setMemberCount(count($community->getMembers()))
            ;
        };
        return $communities;
    }




    // NEW




    #[View(serializerGroups: ["community_basic"])]
    #[Route(path:"/api/communities", methods: ["POST"])]
    #[IsGranted("ROLE_USER")]
    #[Security(name:"Bearer")]
    #[OA\Post(
        tags: ['Community'],
        summary: 'Create a new community',
        requestBody: new OA\RequestBody(
            required: true,
            content: new OA\MediaType(
                mediaType: 'multipart/form-data',
                schema: new OA\Schema(
                    type: 'object',
                    required: ['name', 'location', 'visibility'],
                    properties: [
                        new OA\Property(property: 'name', type: 'string', description: 'Name', example: 'Thomas More University'),
                        new OA\Property(property: 'location', type: 'string', description: 'Community location or address', example: 'Kleinhoefstraat 42440 Geel Belgium'),
                        new OA\Property(property: 'description', type: 'string', description: 'A brief description', example: 'An amazing community'),
                        new OA\Property(property: 'password', type: 'string', description: 'Password if community is private', example: 'secret123'),
                        new OA\Property(property: 'visibility', type: 'string', enum: ['Public', 'Private'], description: 'Community visibility', example: 'Public'),
                        new OA\Property(property: 'image', type: 'string', format: 'binary', description: 'Image upload')
                    ]
                )
            )
        ),
        responses: [
            new OA\Response(
                response: 200,
                description: 'Community created successfully',
                content: new OA\JsonContent(ref: new Model(type: Community::class, groups: ['community_basic']))
            ),
            new OA\Response(
                response: 400,
                description: 'No file provided or no password provided',
            ),
            new OA\Response(
                response: 401,
                description: 'Full authentication is required to access this resource.',
            ),
            new OA\Response(
                response: 403,
                description: 'Reached maximum community joined limit.',
            ),
            new OA\Response(
                response: 422,
                description: 'Invalid password or name',
            )
        ]
    )]
    public function new (
        Request $request,
        #[MapRequestPayload(serializationContext: ["groups" => ["community_new"]])] CommunityNew $dto,
        EntityManagerInterface $em,
        UrlGeneratorInterface $urlGen,
        PasswordHasherFactoryInterface $hasherFactory,
        #[CurrentUser()] User $user,
        CommunityService $communityService
    )
    {
        // Check User
        if ($user === null){ 
           throw new HttpException(Response::HTTP_UNAUTHORIZED, "Full authentication is required to access this resource."); 
        }

        // Check community join limit
        if($communityService->isJoinLimitExceeded($user)){
            throw new AccessDeniedHttpException("You have already joined the limit of " . $communityService->getMaxCommunitiesPerUser() . " communities.");
        }

        // Check name uniqness
        $existing = $em->getRepository(Community::class)->findOneBy(['name' => $dto->name]);
        if ($existing) {
            return $this->json([
                'errors' => [
                    'name' => 'A community with this name already exists.',
                ]
            ], 422);
        }

        // Get password hasher
        $passwordHasher = $hasherFactory->getPasswordHasher(Community::class);

        // Read image content
        $file = $request->files->get('image');
        if ($file === null) { // Make sure an image was sent
            return new JsonResponse(['error' => 'No file provided'], 400);
        }
        $stream = fopen($file->getPathname(), 'rb');


        // Create new entity
        $community = new Community();
        $community
            ->setCreator($user)
            ->setCreatedAt(new \DateTimeImmutable())
            ->setName($dto->name)
            ->setDescription($dto->description)
            ->setLocation($dto->location)
            ->setVisibility(VisibilityEnum::tryFrom($dto->visibility))
            ->setImage(stream_get_contents($stream))
        ;
        
        // Password and visibility
        if ($community->getVisibility() === VisibilityEnum::PRIVATE) {
            if ($dto->password === null){
                return new JsonResponse(['error' => 'A private community needs a password'], 400);
            }else{
                $community->setPassword($passwordHasher->hash($dto->password));
            }
        }

        // Add user as admin
        $member = new Member();
        $member
            ->setUser($user)
            ->setCommunity($community)
            ->setRole(CommunityRoleEnum::ADMIN)
        ;

        $em->persist($member);

        // Close image and saves entities
        fclose($stream);
        $em->persist($community);
        $em ->flush();

        // Set values for return
        $community
            ->setImageUrl($urlGen->generate('api_communities_image', ['id' => $community->getId()]))
            ->setMemberCount(1)
        ;

        // Return new community
        return $community;
    }




    // IMAGE





    #[Route(path:'images/community/{id}.png', methods: ['GET'], name:"api_communities_image")]
    public function getImageUrl(int $id, CommunityRepository $communityRepository)
    {
        // Get community's image
        $community = $communityRepository->find($id);
        $imageContent = $community->getImage();

        // Return image
        return new Response(stream_get_contents($imageContent), 200, [
            'Content-Type' => 'image/png',
            'Content-Disposition' => 'inline; filename="'. $community->getName() .'.png"',
        ]);
    }




    // JOIN




    #[View()]
    #[Route(path:"/api/communities/join", methods: ["POST"])]
    #[IsGranted("ROLE_USER")]
    #[Security(name:"Bearer")]
    #[OA\Post(
        tags: ['Community'],
        summary: 'Join a community',
        requestBody: new OA\RequestBody(
            required: true,
            content: new OA\MediaType(
                mediaType: 'application/json',
                schema: new OA\Schema(
                    type: 'object',
                    required: ['communityId'],
                    properties: [
                        new OA\Property(property: 'communityId', type: 'int', description: 'Community id', example: '1'),
                        new OA\Property(property: 'password', type: 'string', description: 'Password if community is private', example: 'secret123'),
                    ]
                )
            )
        ),
        responses: [
            new OA\Response(
                response: 200,
                description: 'Community joined successfully',
            ),
            new OA\Response(
                response: 400,
                description: 'No password provided',
            ),
            new OA\Response(
                response: 401,
                description: 'Full authentication is required to access this resource.',
            ),
            new OA\Response(
                response: 403,
                description: 'Reached maximum community joined limit.',
            ),
            new OA\Response(
                response: 409,
                description: 'Already joined',
            ),
            new OA\Response(
                response: 422,
                description: 'Invalid password or community',
            )
        ]
    )]    public function join(
        #[MapRequestPayload(serializationContext: ["groups" => ["community_join"]])] CommunityJoin $dto,
        EntityManagerInterface $em,
        PasswordHasherFactoryInterface $hasherFactory,
        #[CurrentUser()] User $user,
        CommunityService $communityService
    )
    {
        // Check User
        if ($user === null){ 
           throw new HttpException(Response::HTTP_UNAUTHORIZED, "Full authentication is required to access this resource."); 
        }

        // Check community join limit
        if($communityService->isJoinLimitExceeded($user)){
            throw new AccessDeniedHttpException("You have already joined the limit of " . $communityService->getMaxCommunitiesPerUser() . " communities.");
        }

        // Get community
        $communityRepo = $em->getRepository(Community::class);
        $community = $communityRepo->find($dto->communityId);
        if (!$community){
            return throw new UnprocessableEntityHttpException('Invalid community id');
        }

        // Check already joined
        $memberRepo = $em->getRepository(Member::class);
        $member = $memberRepo->findOneBy([
            'user' => $user,
            'community' => $community
        ]);
        if ($member !== null) {
            return throw new ConflictHttpException('Already joined this community');
        }

        // Get password hasher
        $passwordHasher = $hasherFactory->getPasswordHasher(Community::class);

        // Check visibility + password
        if($community->getVisibility() === VisibilityEnum::PRIVATE && 
           $community->getPassword() !== null &&
           (
              $dto->password === null ||
             !$passwordHasher->verify($community->getPassword(), $dto->password)
           )
          ){
            throw new UnprocessableEntityHttpException('Invalid password');
        }

        // Join
        $member = new Member();
        $member
            ->setUser($user)
            ->setCommunity($community)
        ;

        $em->persist($member);
        $em ->flush();
        return new JsonResponse("Successfully joined community",200);
    }

}