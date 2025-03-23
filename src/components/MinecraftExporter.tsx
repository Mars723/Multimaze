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
    
    // 处理数值类型字段
    if (name === 'blockType') {
      if (value === 'custom') {
        setIsCustomBlock(true);
        // 保持之前的方块类型不变，直到用户输入自定义值
      } else {
        setIsCustomBlock(false);
        setConfig(prev => ({
          ...prev,
          [name]: value
        }));
      }
    } else if (['offsetX', 'offsetY', 'z', 'scale', 'height'].includes(name)) {
      // 处理数值类型字段
      if (value === '' || value === '-') {
        // 允许空值和单独的负号作为中间状态
        setConfig(prev => ({
          ...prev,
          [name]: value
        }));
      } else {
        // 转换为数字，但不自动转换为0
        const parsedValue = parseInt(value, 10);
        setConfig(prev => ({
          ...prev,
          [name]: isNaN(parsedValue) ? '' : parsedValue
        }));
      }
    } else {
      // 处理非数值类型字段
      setConfig(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  // 处理自定义方块类型输入
  const handleCustomBlockChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setCustomBlockType(value);
    
    // 当用户输入自定义方块类型时，实时更新config
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
    
    // 确保所有必要的数值字段都有有效值
    const validatedConfig: MinecraftExportConfig = {
      ...config,
      // 将空字符串转换为默认值
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
    // 石材系列
    { id: 'stone', name: '石头' },
    { id: 'cobblestone', name: '圆石' },
    { id: 'stone_bricks', name: '石砖' },
    { id: 'deepslate', name: '凝灰岩' },
    { id: 'deepslate_bricks', name: '凝灰岩砖' },
    { id: 'bricks', name: '红砖块' },
    { id: 'sandstone', name: '沙石' },
    { id: 'polished_blackstone_bricks', name: '黑石砖' },
    
    // 下界和末地系列
    { id: 'nether_bricks', name: '下界砖块' },
    { id: 'red_nether_bricks', name: '红色下界砖' },
    { id: 'end_stone_bricks', name: '末地石砖' },
    { id: 'crying_obsidian', name: '哭泣的黑曜石' },
    { id: 'purpur_block', name: '紫珀块' },
    
    // 木材系列
    { id: 'oak_planks', name: '橡木木板' },
    { id: 'dark_oak_planks', name: '深色橡木木板' },
    
    // 装饰方块
    { id: 'quartz_block', name: '石英块' },
    { id: 'prismarine', name: '海晶石' },
    { id: 'lapis_block', name: '青金石块' },
    { id: 'glowstone', name: '荧石' },
    { id: 'purple_concrete', name: '紫色混凝土' },
    
    // 添加自定义选项
    { id: 'custom', name: '自定义方块' }
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
                placeholder="输入自定义方块ID"
                value={customBlockType}
                onChange={handleCustomBlockChange}
              />
              {customBlockType.trim() === '' && (
                <div className="input-hint">请输入有效的Minecraft方块ID</div>
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