import React, { useState } from 'react';
import { Cell } from '../types/maze';
import { 
  MinecraftExportConfig, 
  getMazeMinecraftCommandsText,
  getMazeMinecraftDimensions
} from '../utils/wallMapping/minecraftGenerator';
import './MinecraftExporter.css';

interface MinecraftExporterProps {
  grid: Cell[][];
}

const MinecraftExporter: React.FC<MinecraftExporterProps> = ({ grid }) => {
  const [config, setConfig] = useState<{
    offsetX: number | string;
    offsetY: number | string;
    z: number | string;
    scale: number | string;
    height: number | string;
    blockType: string;
  }>({
    offsetX: 0,
    offsetY: 0,
    z: 4,  // Default to sea level in Minecraft
    scale: 3,
    height: 4,
    blockType: 'stone'
  });

  const [commands, setCommands] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);
  const [isCustomBlock, setIsCustomBlock] = useState<boolean>(false);
  const [customBlockType, setCustomBlockType] = useState<string>('');

  // Handle input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    // Handle block type field
    if (name === 'blockType') {
      if (value === 'custom') {
        setIsCustomBlock(true);
        // Keep previous block type unchanged until user inputs custom value
      } else {
        setIsCustomBlock(false);
        setConfig(prev => ({
          ...prev,
          [name]: value
        }));
      }
    } else if (['offsetX', 'offsetY', 'z', 'scale', 'height'].includes(name)) {
      // Handle numeric fields
      if (value === '' || value === '-') {
        // Allow empty values and single negative sign as intermediate states
        setConfig(prev => ({
          ...prev,
          [name]: value
        }));
      } else {
        // Convert to number, but don't automatically convert to 0
        const parsedValue = parseInt(value, 10);
        setConfig(prev => ({
          ...prev,
          [name]: isNaN(parsedValue) ? '' : parsedValue
        }));
      }
    } else {
      // Handle non-numeric fields
      setConfig(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  // Handle custom block type input
  const handleCustomBlockChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setCustomBlockType(value);
    
    // Update config in real-time when user inputs custom block type
    if (value.trim() !== '') {
      setConfig(prev => ({
        ...prev,
        blockType: value
      }));
    }
  };

  // Generate minecraft commands
  const generateCommands = () => {
    if (!grid || grid.length === 0) return;
    
    // Ensure all necessary numeric fields have valid values
    const validatedConfig: MinecraftExportConfig = {
      ...config,
      // Convert empty strings to default values
      offsetX: typeof config.offsetX === 'string' && (config.offsetX === '' || config.offsetX === '-') ? 0 : Number(config.offsetX),
      offsetY: typeof config.offsetY === 'string' && (config.offsetY === '' || config.offsetY === '-') ? 0 : Number(config.offsetY),
      z: typeof config.z === 'string' && (config.z === '' || config.z === '-') ? 4 : Number(config.z),
      scale: typeof config.scale === 'string' && (config.scale === '' || config.scale === '-') ? 3 : Number(config.scale),
      height: typeof config.height === 'string' && (config.height === '' || config.height === '-') ? 4 : Number(config.height)
    };
    
    const commandsText = getMazeMinecraftCommandsText(grid, validatedConfig);
    setCommands(commandsText);
    setCopied(false);
  };

  // Copy commands to clipboard
  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(commands);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000); // Reset after 2 seconds
    } catch (err) {
      console.error('Failed to copy: ', err);
      alert('Failed to copy commands. Please try again or copy manually.');
    }
  };

  // Calculate maze dimensions in blocks
  const dimensions = getMazeMinecraftDimensions(grid, typeof config.scale === 'string' ? 
    (config.scale === '' || config.scale === '-' ? 3 : Number(config.scale)) : 
    config.scale);

  // Block type options
  const blockOptions = [
    // Stone series
    { id: 'stone', name: 'Stone' },
    { id: 'cobblestone', name: 'Cobblestone' },
    { id: 'stone_bricks', name: 'Stone Bricks' },
    { id: 'deepslate', name: 'Deepslate' },
    { id: 'deepslate_bricks', name: 'Deepslate Bricks' },
    { id: 'bricks', name: 'Bricks' },
    { id: 'sandstone', name: 'Sandstone' },
    { id: 'polished_blackstone_bricks', name: 'Polished Blackstone Bricks' },
    
    // Nether and End series
    { id: 'nether_bricks', name: 'Nether Bricks' },
    { id: 'red_nether_bricks', name: 'Red Nether Bricks' },
    { id: 'end_stone_bricks', name: 'End Stone Bricks' },
    { id: 'crying_obsidian', name: 'Crying Obsidian' },
    { id: 'purpur_block', name: 'Purpur Block' },
    
    // Wood series
    { id: 'oak_planks', name: 'Oak Planks' },
    { id: 'dark_oak_planks', name: 'Dark Oak Planks' },
    
    // Decorative blocks
    { id: 'quartz_block', name: 'Quartz Block' },
    { id: 'prismarine', name: 'Prismarine' },
    { id: 'lapis_block', name: 'Lapis Block' },
    { id: 'glowstone', name: 'Glowstone' },
    { id: 'purple_concrete', name: 'Purple Concrete' },
    
    // Add custom option
    { id: 'custom', name: 'Custom Block' }
  ];

  return (
    <div className="minecraft-exporter">
      <div className="config-section">
        <div className="config-row">
          <label htmlFor="offsetX">X Offset:</label>
          <input
            type="number"
            id="offsetX"
            name="offsetX"
            value={config.offsetX}
            onChange={handleChange}
          />
        </div>
        
        <div className="config-row">
          <label htmlFor="offsetZ">Z Offset:</label>
          <input
            type="number"
            id="offsetY"
            name="offsetY"
            value={config.offsetY}
            onChange={handleChange}
          />
        </div>
        
        <div className="config-row">
          <label htmlFor="z">Y Coordinate (Height):</label>
          <input
            type="number"
            id="z"
            name="z"
            value={config.z}
            onChange={handleChange}
          />
        </div>
        
        <div className="config-row">
          <label htmlFor="scale">Scale Factor:</label>
          <input
            type="number"
            id="scale"
            name="scale"
            min="1"
            max="10"
            value={config.scale}
            onChange={handleChange}
          />
        </div>
        
        <div className="config-row">
          <label htmlFor="height">Wall Height:</label>
          <input
            type="number"
            id="height"
            name="height"
            min="1"
            max="10"
            value={config.height}
            onChange={handleChange}
          />
        </div>
        
        <div className="config-row">
          <label htmlFor="blockType">Block Type:</label>
          <select
            id="blockType"
            name="blockType"
            value={isCustomBlock ? 'custom' : config.blockType}
            onChange={handleChange}
          >
            {blockOptions.map(block => (
              <option key={block.id} value={block.id}>
                {block.name}
              </option>
            ))}
          </select>
          
          {isCustomBlock && (
            <div className="custom-block-input">
              <input
                type="text"
                placeholder="Enter custom block ID"
                value={customBlockType}
                onChange={handleCustomBlockChange}
              />
              {customBlockType.trim() === '' && (
                <div className="input-hint">Please enter a valid Minecraft block ID</div>
              )}
            </div>
          )}
        </div>
      </div>
      
      <div className="dimension-info">
        Maze will be {dimensions.width} × {dimensions.height} blocks in size
      </div>
      
      <div className="button-section">
        <button onClick={generateCommands}>Generate Commands</button>
        {commands && (
          <button onClick={copyToClipboard}>
            {copied ? 'Copied!' : 'Copy to Clipboard'}
          </button>
        )}
      </div>
      
      {commands && (
        <div className="commands-section">
          <h4>Minecraft Commands:</h4>
          <pre>{commands}</pre>
        </div>
      )}
      
      <div className="pdf-link-section">
        <a href="/mcfunction.pdf" target="_blank" rel="noopener noreferrer">
          Minecraft Functions Documentation (PDF)
        </a>
      </div>
    </div>
  );
};

export default MinecraftExporter; 