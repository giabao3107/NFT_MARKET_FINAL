import React, { useState } from 'react';
import {
  Box,
  Container,
  Flex,
  VStack,
  HStack,
  Text,
  Link,
  Button,
  Input,
  InputGroup,
  InputRightElement,
  Divider,
  useColorModeValue,
  Grid,
  GridItem,
  IconButton,
  useToast,
  Badge,
  Tooltip,
  useBreakpointValue
} from '@chakra-ui/react';
import {
  FiMail,
  FiSend,
  FiTwitter,
  FiGithub,
  FiMessageCircle,
  FiExternalLink,
  FiHeart,
  FiShield,
  FiTrendingUp,
  FiUsers,
  FiGlobe,
  FiBook,
  FiHelpCircle,
  FiFileText,
  FiLock,
  FiInfo,
  FiStar,
  FiAward,
  FiZap,
  FiCode
} from 'react-icons/fi';
import { Link as RouterLink } from 'react-router-dom';
import { Logo } from './Header';
import { useCustomToast } from '../common/Toast';

/**
 * Newsletter Subscription Component
 */
const NewsletterSubscription = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const toast = useCustomToast();
  
  const handleSubscribe = async (e) => {
    e.preventDefault();
    
    if (!email || !email.includes('@')) {
      toast.error('Invalid Email', 'Please enter a valid email address');
      return;
    }
    
    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      toast.success('Subscribed!', 'Thank you for subscribing to our newsletter');
      setEmail('');
      setIsLoading(false);
    }, 1000);
  };
  
  return (
    <Box>
      <Text fontSize="lg" fontWeight="semibold" mb={2}>
        Stay Updated
      </Text>
      <Text fontSize="sm" color="gray.600" mb={4}>
        Get the latest news, updates, and exclusive drops delivered to your inbox.
      </Text>
      
      <form onSubmit={handleSubscribe}>
        <InputGroup size="md">
          <Input
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            bg={useColorModeValue('white', 'gray.700')}
            border="1px"
            borderColor={useColorModeValue('gray.300', 'gray.600')}
            _hover={{
              borderColor: useColorModeValue('gray.400', 'gray.500')
            }}
            _focus={{
              borderColor: 'blue.500',
              boxShadow: '0 0 0 1px blue.500'
            }}
          />
          <InputRightElement>
            <IconButton
              type="submit"
              size="sm"
              colorScheme="blue"
              icon={<FiSend />}
              isLoading={isLoading}
              aria-label="Subscribe"
            />
          </InputRightElement>
        </InputGroup>
      </form>
      
      <Text fontSize="xs" color="gray.500" mt={2}>
        We respect your privacy. Unsubscribe at any time.
      </Text>
    </Box>
  );
};

/**
 * Social Links Component
 */
const SocialLinks = () => {
  const socialLinks = [
    {
      name: 'Twitter',
      icon: FiTwitter,
      url: 'https://twitter.com/nftmarket',
      color: 'twitter'
    },
    {
      name: 'Discord',
      icon: FiMessageCircle,
      url: 'https://discord.gg/nftmarket',
      color: 'purple'
    },
    {
      name: 'GitHub',
      icon: FiGithub,
      url: 'https://github.com/nftmarket',
      color: 'gray'
    },
    {
      name: 'Medium',
      icon: FiFileText,
      url: 'https://medium.com/@nftmarket',
      color: 'green'
    }
  ];
  
  return (
    <HStack spacing={3}>
      {socialLinks.map((social) => (
        <Tooltip key={social.name} label={social.name} hasArrow>
          <IconButton
            as={Link}
            href={social.url}
            isExternal
            variant="ghost"
            colorScheme={social.color}
            icon={<social.icon />}
            size="sm"
            aria-label={social.name}
            _hover={{
              transform: 'translateY(-2px)',
              shadow: 'md'
            }}
            transition="all 0.2s"
          />
        </Tooltip>
      ))}
    </HStack>
  );
};



/**
 * Footer Links Configuration
 */
const footerLinks = {
  marketplace: {
    title: 'Marketplace',
    links: [
      { label: 'Explore', path: '/explore', icon: FiGlobe },
      { label: 'Collections', path: '/collections', icon: FiStar },
      { label: 'Rankings', path: '/rankings', icon: FiTrendingUp },
      { label: 'Activity', path: '/activity', icon: FiZap },
      { label: 'Stats', path: '/stats', icon: FiTrendingUp }
    ]
  },
  account: {
    title: 'My Account',
    links: [
      { label: 'Profile', path: '/profile', icon: FiUsers },
      { label: 'My NFTs', path: '/profile/collected', icon: FiStar },
      { label: 'Favorites', path: '/profile/favorites', icon: FiHeart },
      { label: 'Watchlist', path: '/profile/watchlist', icon: FiStar },
      { label: 'Settings', path: '/settings', icon: FiStar }
    ]
  },
  resources: {
    title: 'Resources',
    links: [
      { label: 'Help Center', path: '/help', icon: FiHelpCircle },
      { label: 'Documentation', path: '/docs', icon: FiBook },
      { label: 'API Reference', path: '/api-docs', icon: FiCode },
      { label: 'Blog', path: '/blog', icon: FiFileText },
      { label: 'Newsletter', path: '/newsletter', icon: FiMail }
    ]
  },
  company: {
    title: 'Company',
    links: [
      { label: 'About Us', path: '/about', icon: FiInfo },
      { label: 'Careers', path: '/careers', icon: FiUsers },
      { label: 'Press Kit', path: '/press', icon: FiFileText },
      { label: 'Partners', path: '/partners', icon: FiAward },
      { label: 'Contact', path: '/contact', icon: FiMail }
    ]
  },
  legal: {
    title: 'Legal',
    links: [
      { label: 'Terms of Service', path: '/terms', icon: FiFileText },
      { label: 'Privacy Policy', path: '/privacy', icon: FiLock },
      { label: 'Cookie Policy', path: '/cookies', icon: FiShield },
      { label: 'DMCA', path: '/dmca', icon: FiShield },
      { label: 'Licenses', path: '/licenses', icon: FiFileText }
    ]
  }
};

/**
 * Footer Section Component
 */
const FooterSection = ({ title, links }) => {
  return (
    <VStack spacing={3} align="flex-start">
      <Text fontSize="sm" fontWeight="semibold" color="gray.700" _dark={{ color: 'gray.300' }}>
        {title}
      </Text>
      <VStack spacing={2} align="flex-start">
        {links.map((link) => (
          <Link
            key={link.path}
            as={RouterLink}
            to={link.path}
            fontSize="sm"
            color="gray.600"
            _dark={{ color: 'gray.400' }}
            _hover={{ 
              color: 'blue.500',
              textDecoration: 'none'
            }}
            transition="color 0.2s"
          >
            <HStack spacing={2}>
              {link.icon && <Box as={link.icon} size={14} />}
              <Text>{link.label}</Text>
            </HStack>
          </Link>
        ))}
      </VStack>
    </VStack>
  );
};

/**
 * Main Footer Component
 */
const Footer = () => {
  const bgColor = useColorModeValue('gray.50', 'gray.900');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const isMobile = useBreakpointValue({ base: true, md: false });
  
  return (
    <Box
      as="footer"
      bg={bgColor}
      borderTop="1px"
      borderColor={borderColor}
      mt="auto"
    >
      <Container maxW="container.xl" py={12}>
        <VStack spacing={8}>
          
          {/* Main Footer Content */}
          <Grid
            templateColumns={{
              base: 'repeat(1, 1fr)',
              sm: 'repeat(2, 1fr)',
              md: 'repeat(3, 1fr)',
              lg: 'repeat(6, 1fr)'
            }}
            gap={8}
            w="full"
          >
            {/* Brand & Newsletter */}
            <GridItem colSpan={{ base: 1, md: 2 }}>
              <VStack spacing={6} align="flex-start">
                {/* Brand */}
                <VStack spacing={4} align="flex-start">
                  <Logo size="md" />
                  <Text
                    color="gray.600"
                    _dark={{ color: 'gray.400' }}
                    maxW="300px"
                    fontSize="sm"
                    lineHeight="1.6"
                  >
                    The world's first and largest digital marketplace for crypto collectibles 
                    and non-fungible tokens (NFTs). Buy, sell, and discover exclusive digital items.
                  </Text>
                  
                  {/* Badges */}
                  <HStack spacing={2} flexWrap="wrap">
                    <Badge colorScheme="green" variant="subtle">
                      <HStack spacing={1}>
                        <FiShield size={12} />
                        <Text fontSize="xs">Secure</Text>
                      </HStack>
                    </Badge>
                    <Badge colorScheme="blue" variant="subtle">
                      <HStack spacing={1}>
                        <FiZap size={12} />
                        <Text fontSize="xs">Fast</Text>
                      </HStack>
                    </Badge>
                    <Badge colorScheme="purple" variant="subtle">
                      <HStack spacing={1}>
                        <FiAward size={12} />
                        <Text fontSize="xs">Trusted</Text>
                      </HStack>
                    </Badge>
                  </HStack>
                </VStack>
                
                {/* Newsletter */}
                {!isMobile && <NewsletterSubscription />}
              </VStack>
            </GridItem>
            
            {/* Footer Links */}
            {Object.entries(footerLinks).map(([key, section]) => (
              <GridItem key={key}>
                <FooterSection title={section.title} links={section.links} />
              </GridItem>
            ))}
          </Grid>
          
          {/* Mobile Newsletter */}
          {isMobile && (
            <>
              <Divider />
              <Box w="full">
                <NewsletterSubscription />
              </Box>
            </>
          )}
          
          <Divider />
          
          {/* Bottom Footer */}
          <Flex
            direction={{ base: 'column', md: 'row' }}
            justify="space-between"
            align="center"
            w="full"
            gap={4}
          >
            <VStack spacing={2} align={{ base: 'center', md: 'flex-start' }}>
              <Text fontSize="sm" color="gray.600" _dark={{ color: 'gray.400' }}>
                © 2024 NFTMarket. All rights reserved.
              </Text>
              <HStack spacing={4} fontSize="xs" color="gray.500">
                <Text>Made with</Text>
                <HStack spacing={1}>
                  <FiHeart color="red" />
                  <Text>by the NFTMarket team</Text>
                </HStack>
              </HStack>
            </VStack>
            
            <VStack spacing={3} align={{ base: 'center', md: 'flex-end' }}>
              <SocialLinks />
              <HStack spacing={4} fontSize="xs" color="gray.500">
                <Text>Version 2.1.0</Text>
                <Text>•</Text>
                <Link href="/status" _hover={{ color: 'blue.500' }}>
                  System Status
                </Link>
                <Text>•</Text>
                <Link href="/changelog" _hover={{ color: 'blue.500' }}>
                  Changelog
                </Link>
              </HStack>
            </VStack>
          </Flex>
        </VStack>
      </Container>
    </Box>
  );
};

export default Footer;
export { NewsletterSubscription, SocialLinks, FooterSection };