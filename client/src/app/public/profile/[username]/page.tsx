// File path: app/public/profile/[username]/page.tsx

export default function PublicProfilePage() {
    return (
      // This is just a wrapper for client component
      <PublicProfilePageClient />
    );
  }
  
  // Import the client component from your components directory
  import PublicProfilePageClient from '@/components/public-profile-page';