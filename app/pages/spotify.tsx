"use client";
import { useEffect, useState } from 'react';
import SpotifyLogo from '../spotify-transparent.png';
import SLogo from '../spotifylogo.jpg';
import Image from 'next/image';

const Spotify = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const ACCESS_TOKEN = process.env.NEXT_PUBLIC_ACCESS_TOKEN || '';
  const REFRESH_TOKEN = process.env.NEXT_PUBLIC_REFRESH_TOKEN || '';
  const CLIENT_ID = process.env.NEXT_PUBLIC_CLIENT_ID || '';
  const CLIENT_SECRET = process.env.NEXT_PUBLIC_CLIENT_SECRET || '';

  const fetchNowPlaying = async () => {
    try {
      let accessToken = ACCESS_TOKEN;

      const isExpired = true; 

      if (isExpired) {
        const tokenResponse = await fetch('https://accounts.spotify.com/api/token', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            Authorization: `Basic ${btoa(`${CLIENT_ID}:${CLIENT_SECRET}`)}`,
          },
          body: new URLSearchParams({
            grant_type: 'refresh_token',
            refresh_token: REFRESH_TOKEN,
          }).toString(),
        });

        if (!tokenResponse.ok) {
          throw new Error('Failed to refresh access token');
        }

        const tokenData = await tokenResponse.json();
        accessToken = tokenData.access_token;
      }

      const response = await fetch('https://api.spotify.com/v1/me/player/currently-playing', {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch data from Spotify');
      }

      const result = await response.json();
      setData(result);
      setLoading(false);
    } catch (err) {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNowPlaying();

    const intervalId = setInterval(fetchNowPlaying, 5000);

    return () => clearInterval(intervalId);
  }, []);
  if (!data || !data.is_playing) {
    return <div className="box boxanimation flex flex-col justify-center items-center"><p className='quote-text-by'>Not listening to anything right now.</p><Image className='logo' width={100} src={SLogo} alt='' /></div>;
  }

  const { item } = data;

  return (
    <div className="box boxanimation flex md:flex-col gap-4">
      <img
        className="albumImage"
        src={item.album.images[0].url}
        alt={`Album cover of ${item.album.name}`}
        width={100}
        height={100}
      />
      <div className='flex flex-col gap-2'>
        <div className='flex flex-col justify-between h-[calc(100%-150px)]'>
          <div>
            <p className="nowPlaying">Now listening:</p>
          </div>
          <div className='flex gap-2 mb-12'>
            <div>
              <a
                className="link"
                href={item.external_urls.spotify}
                target="_blank"
                rel="noopener noreferrer"
              >
                {item.name} by   {item.artists.map((artist: { name: any }) => artist.name).join(', ').slice(0, 15) + (item.artists.map((artist: { name: any }) => artist.name).join(', ').length > 15 ? '...' : '')}
              </a>
            </div>
            <div className="playing">
              <div className="greenline line-1"></div>
              <div className="greenline line-2"></div>
              <div className="greenline line-3"></div>
              <div className="greenline line-4"></div>
              <div className="greenline line-5"></div>
            </div>
          </div>
        </div>
        <Image className='logo fixed bottom-4 w-[100px] md:w-[150px]'  height={80} src={SpotifyLogo} alt='' />
      </div>
    </div>
  );
};

export default Spotify;
