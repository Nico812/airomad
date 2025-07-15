import React from 'react';
import Link from 'next/link';

const TILE_DIMENSION = 20;

export default function NavBar({ currentPage, onPageChange }) {
  return (
    <div className="nav-bar">
      <button className="nav-bar-button" onClick={() => onPageChange('map')}>
      <img src="/TileGIFs/map.gif" style={{ width: `${3*TILE_DIMENSION}px`, imageRendering: 'pixelated' }} />
      </button>
      <button className="nav-bar-button" onClick={() => onPageChange('train')}>
      <img src="/TileGIFs/train.gif" style={{ width: `${3*TILE_DIMENSION}px`, imageRendering: 'pixelated'}} />
      </button>
      <button className="nav-bar-button" onClick={() => onPageChange('upgrade')}>
      <img src="/TileGIFs/upgrade.gif" style={{ width: `${3*TILE_DIMENSION}px`, imageRendering: 'pixelated'}} />
      </button>
      <button className="nav-bar-button" onClick={() => onPageChange('attack')}>
      <img src="/TileGIFs/upgrade.gif" style={{ width: `${3*TILE_DIMENSION}px`, imageRendering: 'pixelated'}} />
      </button>
    </div>
  );
}