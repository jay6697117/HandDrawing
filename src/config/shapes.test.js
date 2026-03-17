/**
 * shapes.js 单元测试
 * 测试图形配置查询和模板点集生成
 */
import { describe, it, expect } from 'vitest'
import {
  chapters,
  shapes,
  getShapeById,
  getShapesByChapter,
  getChapter,
  getTemplatePoints
} from './shapes'

// ========== 数据完整性测试 ==========

describe('shapes 数据完整性', () => {
  it('共有 8 个章节', () => {
    expect(chapters.length).toBe(8)
  })

  it('共有 40 个图形', () => {
    expect(shapes.length).toBe(40)
  })

  it('每个章节有 5 个图形', () => {
    for (let i = 1; i <= 8; i++) {
      const chapterShapes = shapes.filter(s => s.chapter === i)
      expect(chapterShapes.length).toBe(5)
    }
  })

  it('每个图形都有必需字段（id, name, chapter, type, drawFn）', () => {
    shapes.forEach(shape => {
      expect(shape.id).toBeDefined()
      expect(typeof shape.id).toBe('string')
      expect(shape.name).toBeDefined()
      expect(typeof shape.name).toBe('string')
      expect(shape.chapter).toBeDefined()
      expect(typeof shape.chapter).toBe('number')
      expect(shape.type).toBeDefined()
      expect(typeof shape.drawFn).toBe('function')
    })
  })

  it('图形 ID 唯一', () => {
    const ids = shapes.map(s => s.id)
    const uniqueIds = new Set(ids)
    expect(uniqueIds.size).toBe(ids.length)
  })

  it('每个章节都有 passThreshold', () => {
    chapters.forEach(ch => {
      expect(typeof ch.passThreshold).toBe('number')
      expect(ch.passThreshold).toBeGreaterThan(0)
      expect(ch.passThreshold).toBeLessThanOrEqual(100)
    })
  })
})

// ========== 查询函数测试 ==========

describe('getShapeById - 根据 ID 查询图形', () => {
  it('查询存在的图形返回正确结果', () => {
    const circle = getShapeById('circle')
    expect(circle).toBeDefined()
    expect(circle.id).toBe('circle')
    expect(circle.name).toBe('圆形')
    expect(circle.type).toBe('circle')
  })

  it('查询不存在的图形返回 undefined', () => {
    expect(getShapeById('nonexistent')).toBeUndefined()
  })
})

describe('getShapesByChapter - 根据章节查询图形', () => {
  it('第一章有 5 个图形', () => {
    const ch1Shapes = getShapesByChapter(1)
    expect(ch1Shapes.length).toBe(5)
  })

  it('返回的图形都属于指定章节', () => {
    const ch3Shapes = getShapesByChapter(3)
    ch3Shapes.forEach(s => {
      expect(s.chapter).toBe(3)
    })
  })

  it('不存在的章节返回空数组', () => {
    expect(getShapesByChapter(99)).toEqual([])
  })
})

describe('getChapter - 查询章节配置', () => {
  it('查询第一章', () => {
    const ch = getChapter(1)
    expect(ch).toBeDefined()
    expect(ch.id).toBe(1)
    expect(ch.name).toBe('基础圆与方')
  })

  it('最后一章标记 isFinal', () => {
    const ch8 = getChapter(8)
    expect(ch8.isFinal).toBe(true)
  })

  it('不存在的章节返回 undefined', () => {
    expect(getChapter(99)).toBeUndefined()
  })
})

// ========== 模板点集测试 ==========

describe('getTemplatePoints - 模板点集生成', () => {
  it('圆形模板返回 96 个点', () => {
    const points = getTemplatePoints('circle')
    expect(points).toBeDefined()
    expect(points.length).toBe(96)
  })

  it('模板点坐标在合理范围内（约 [0, 1]）', () => {
    const points = getTemplatePoints('circle')
    points.forEach(p => {
      expect(p.x).toBeGreaterThanOrEqual(-0.1)
      expect(p.x).toBeLessThanOrEqual(1.1)
      expect(p.y).toBeGreaterThanOrEqual(-0.1)
      expect(p.y).toBeLessThanOrEqual(1.1)
    })
  })

  it('不存在的图形返回 null', () => {
    expect(getTemplatePoints('nonexistent')).toBeNull()
  })

  it('多次调用返回相同结果（缓存机制）', () => {
    const first = getTemplatePoints('square')
    const second = getTemplatePoints('square')
    expect(first).toBe(second) // 引用相等（同一个缓存对象）
  })

  it('所有 40 个图形都能成功生成模板点集', () => {
    shapes.forEach(shape => {
      const points = getTemplatePoints(shape.id)
      expect(points).toBeDefined()
      expect(points).not.toBeNull()
      expect(points.length).toBeGreaterThan(0)
      // 验证每个点都有 x 和 y
      points.forEach(p => {
        expect(typeof p.x).toBe('number')
        expect(typeof p.y).toBe('number')
        expect(isNaN(p.x)).toBe(false)
        expect(isNaN(p.y)).toBe(false)
      })
    })
  })
})
