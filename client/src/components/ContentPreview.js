import React, { useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { atomDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import DOMPurify from 'dompurify';
import 'katex/dist/katex.min.css';
import { renderToString } from 'katex';
import './RichTextEditor.css';
import { initializeQuizzes } from '../utils/quizHandler';

const ContentPreview = ({ content, title, type, metadata }) => {
  // Import analytics context
  const { trackFeatureUse } = React.useContext(require('../context/AnalyticsContext').default);
  // Configure DOMPurify to allow math, code execution, and quiz elements
  DOMPurify.addHook('afterSanitizeAttributes', function(node) {
    // Allow math notation
    if (node.tagName === 'SPAN' && node.textContent.includes('\\(') && node.textContent.includes('\\)')) {
      node.className = 'math-inline';
    }
    if (node.tagName === 'DIV' && node.textContent.includes('\\[') && node.textContent.includes('\\]')) {
      node.className = 'math-block';
    }

    // Allow iframes for embedded videos with safe sources
    if (node.tagName === 'IFRAME') {
      const src = node.getAttribute('src') || '';
      if (src.startsWith('https://www.youtube.com/') ||
          src.startsWith('https://player.vimeo.com/') ||
          src.startsWith('https://www.loom.com/')) {
        node.setAttribute('allowfullscreen', 'true');
      }
    }

    // Allow quiz elements with their data attributes
    if (node.tagName === 'DIV' && node.classList.contains('embedded-quiz')) {
      // Preserve the quiz data attribute
      if (node.hasAttribute('data-quiz')) {
        const quizData = node.getAttribute('data-quiz');
        node.setAttribute('data-quiz', quizData);
      }
    }
  });

  // Configure DOMPurify to allow quiz data attributes
  DOMPurify.setConfig({
    ADD_ATTR: ['data-quiz', 'data-index', 'data-initialized'],
    ADD_TAGS: ['button']
  });

  // Add quiz tracking function to window
  useEffect(() => {
    // Define the tracking function
    window.trackQuizCompletion = (quizTitle, score, correct, total) => {
      if (trackFeatureUse) {
        trackFeatureUse('quiz_completed', {
          quizTitle,
          score,
          correct,
          total,
          contentTitle: title
        });
      }
    };

    // Cleanup
    return () => {
      delete window.trackQuizCompletion;
    };
  }, [trackFeatureUse, title]);

  // Process math notation and initialize quizzes
  useEffect(() => {
    if (!content) return;

    // Process math notation if present
    if (content.includes('\\')) {
      // Process inline math: \( ... \)
      const inlineElements = document.querySelectorAll('.math-inline');
      inlineElements.forEach(el => {
        try {
          const math = el.textContent.replace('\\(', '').replace('\\)', '');
          el.innerHTML = renderToString(math, { displayMode: false });
        } catch (error) {
          console.error('Error rendering inline math:', error);
        }
      });

      // Process block math: \[ ... \]
      const blockElements = document.querySelectorAll('.math-block');
      blockElements.forEach(el => {
        try {
          const math = el.textContent.replace('\\[', '').replace('\\]', '');
          el.innerHTML = renderToString(math, { displayMode: true });
        } catch (error) {
          console.error('Error rendering block math:', error);
        }
      });
    }

    // Initialize quizzes if present
    if (content.includes('embedded-quiz')) {
      // Use setTimeout to ensure DOM is fully rendered
      setTimeout(() => {
        initializeQuizzes();

        // Track that quizzes were found in the content
        if (trackFeatureUse) {
          trackFeatureUse('quiz_content_viewed', {
            contentTitle: title
          });
        }
      }, 100);
    }
  }, [content, trackFeatureUse, title]);

  // Function to convert HTML content to Markdown if needed
  const getContentForPreview = () => {
    // If content is HTML (from rich text editor), sanitize it
    if (content && content.includes('<')) {
      return { __html: DOMPurify.sanitize(content) };
    }

    // Otherwise, return as is for markdown rendering
    return null;
  };

  const sanitizedContent = getContentForPreview();

  return (
    <div className="content-preview">
      <h3>Preview</h3>

      <div className="preview-header">
        <h2>{title || 'Untitled'}</h2>
        {type && <div className="preview-type">{type.replace('_', ' ')}</div>}

        {metadata && metadata.tags && metadata.tags.length > 0 && (
          <div className="preview-tags">
            {metadata.tags.map((tag, index) => (
              <span key={index} className="preview-tag">{tag}</span>
            ))}
          </div>
        )}

        {metadata && metadata.level && (
          <div className="preview-level">
            Level: {metadata.level.charAt(0).toUpperCase() + metadata.level.slice(1)}
          </div>
        )}
      </div>

      <div className="preview-content">
        {sanitizedContent ? (
          // Render HTML content
          <div dangerouslySetInnerHTML={sanitizedContent} />
        ) : (
          // Render Markdown content
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              code({node, inline, className, children, ...props}) {
                const match = /language-(\w+)/.exec(className || '');
                return !inline && match ? (
                  <SyntaxHighlighter
                    style={atomDark}
                    language={match[1]}
                    PreTag="div"
                    {...props}
                  >
                    {String(children).replace(/\n$/, '')}
                  </SyntaxHighlighter>
                ) : (
                  <code className={className} {...props}>
                    {children}
                  </code>
                );
              }
            }}
          >
            {content || '*No content to preview*'}
          </ReactMarkdown>
        )}
      </div>
    </div>
  );
};

export default ContentPreview;
