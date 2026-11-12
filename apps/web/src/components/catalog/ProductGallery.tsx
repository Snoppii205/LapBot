import { useEffect, useRef, useState, type KeyboardEvent } from 'react';
import type { ProductImage } from '@lapbot/contracts';
import { catalogImageUrl } from '../../lib/catalog-image.js';
import { IconChevronLeft, IconChevronRight } from '../icons/RetroIcons.js';
import { ProgressiveImage } from '../os/RetroOsPrimitives.js';

export function ProductGallery({
  images,
  modelName
}: {
  images: ProductImage[];
  modelName: string;
}) {
  const [selected, setSelected] = useState(0);
  const touchStart = useRef<number | null>(null);

  useEffect(() => {
    setSelected(0);
  }, [images]);

  if (!images.length) {
    return (
      <div className="product-detail-image gallery-empty">Ảnh sản phẩm đang được cập nhật</div>
    );
  }

  const choose = (index: number) => {
    setSelected((index + images.length) % images.length);
  };

  const handleKeyDown = (event: KeyboardEvent) => {
    if (event.key === 'ArrowLeft') {
      event.preventDefault();
      choose(selected - 1);
    } else if (event.key === 'ArrowRight') {
      event.preventDefault();
      choose(selected + 1);
    }
  };

  const onTouchEnd = (endX: number) => {
    if (touchStart.current !== null && Math.abs(endX - touchStart.current) > 40) {
      choose(selected + (endX < touchStart.current ? 1 : -1));
    }
    touchStart.current = null;
  };

  const hasMultiple = images.length > 1;

  return (
    <figure
      className="product-gallery"
      aria-label={`Ảnh sản phẩm ${modelName}`}
      tabIndex={0}
      onKeyDown={handleKeyDown}
    >
      <div
        className="product-detail-image gallery-stage"
        onTouchStart={event => {
          touchStart.current = event.touches[0]?.clientX ?? null;
        }}
        onTouchEnd={event => onTouchEnd(event.changedTouches[0]?.clientX ?? 0)}
      >
        <div className="gallery-track" aria-live="polite">
          {images.map((image, index) => {
            const url = catalogImageUrl(image.image_url);
            return (
              <div
                className={index === selected ? 'gallery-slide selected' : 'gallery-slide'}
                key={`${image.image_url}-${index}`}
                aria-hidden={index !== selected}
              >
                <ProgressiveImage
                  src={url}
                  alt={
                    index === selected ? `${modelName}, ảnh ${index + 1} trên ${images.length}` : ''
                  }
                  loading={index < 2 ? 'eager' : 'lazy'}
                  width={850}
                  height={520}
                  fallback={<span>Ảnh chưa có</span>}
                />
              </div>
            );
          })}
        </div>

        {hasMultiple && (
          <>
            <button
              type="button"
              className="gallery-nav-btn gallery-nav-prev"
              onClick={() => choose(selected - 1)}
              aria-label="Xem ảnh trước"
              title="Ảnh trước (phím ←)"
            >
              <IconChevronLeft size={18} />
            </button>

            <button
              type="button"
              className="gallery-nav-btn gallery-nav-next"
              onClick={() => choose(selected + 1)}
              aria-label="Xem ảnh kế tiếp"
              title="Ảnh tiếp theo (phím →)"
            >
              <IconChevronRight size={18} />
            </button>

            <div className="gallery-counter-badge" aria-hidden="true">
              <span>{selected + 1}</span>
              <span className="counter-sep">/</span>
              <span>{images.length}</span>
            </div>
          </>
        )}
      </div>

      {hasMultiple && (
        <div className="gallery-thumbnails" aria-label="Chọn ảnh sản phẩm">
          {images.map((image, index) => (
            <button
              type="button"
              key={`${image.image_url}-${index}`}
              className={index === selected ? 'gallery-thumbnail selected' : 'gallery-thumbnail'}
              aria-label={`Xem ảnh ${index + 1} trên ${images.length}`}
              aria-pressed={index === selected}
              onClick={() => choose(index)}
            >
              <img
                src={catalogImageUrl(image.image_url) ?? ''}
                alt=""
                loading="lazy"
                width="88"
                height="66"
              />
            </button>
          ))}
        </div>
      )}
    </figure>
  );
}
