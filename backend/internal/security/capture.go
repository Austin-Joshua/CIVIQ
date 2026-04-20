package security

import (
	"bytes"
	"io"
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"
)

const (
	ctxSecBodyPreview = "civiq_sec_body_preview"
	ctxSecHeaders     = "civiq_sec_headers_snapshot"
)

func headerSnapshot(h http.Header) map[string]string {
	out := map[string]string{}
	for _, k := range []string{"User-Agent", "Accept", "Content-Type", "Origin", "Referer", "X-Forwarded-For", "Accept-Language"} {
		if v := h.Get(k); v != "" {
			out[strings.ToLower(k)] = v
		}
	}
	return out
}

// BodyCaptureMiddleware snapshots a bounded request body for async ML analysis.
// Must run before AuditMiddleware so the handler can still read the restored body.
func (s *Service) BodyCaptureMiddleware() gin.HandlerFunc {
	const maxBody = 32 * 1024
	return func(c *gin.Context) {
		if !s.mlEnabled() {
			c.Next()
			return
		}
		path := c.Request.URL.Path
		if isExemptPath(path) {
			c.Next()
			return
		}
		c.Set(ctxSecHeaders, headerSnapshot(c.Request.Header))
		if c.Request.Body == nil {
			c.Set(ctxSecBodyPreview, "")
			c.Next()
			return
		}
		raw, err := io.ReadAll(io.LimitReader(c.Request.Body, maxBody))
		if err != nil {
			c.Set(ctxSecBodyPreview, "")
			c.Request.Body = io.NopCloser(bytes.NewReader(nil))
			c.Next()
			return
		}
		c.Request.Body = io.NopCloser(bytes.NewReader(raw))
		c.Set(ctxSecBodyPreview, string(raw))
		c.Next()
	}
}
