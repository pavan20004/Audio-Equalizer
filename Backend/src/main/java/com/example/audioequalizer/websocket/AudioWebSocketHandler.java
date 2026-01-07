package com.example.audioequalizer.websocket;

import org.springframework.stereotype.Component;
import org.springframework.web.reactive.socket.WebSocketHandler;
import org.springframework.web.reactive.socket.WebSocketMessage;
import org.springframework.web.reactive.socket.WebSocketSession;

import com.example.audioequalizer.gemini.GeminiStreamingService;

import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

@Component
public class AudioWebSocketHandler implements WebSocketHandler {

    private final GeminiStreamingService geminiService;

    public AudioWebSocketHandler(GeminiStreamingService geminiService) {
        this.geminiService = geminiService;
    }

    @Override
    public Mono<Void> handle(WebSocketSession session) {

        Flux<byte[]> audioChunks =
            session.receive()
                   .filter(msg -> msg.getType() == WebSocketMessage.Type.BINARY)
                   .map(WebSocketMessage::getPayload)
                   .map(buffer -> {
                       byte[] bytes = new byte[buffer.readableByteCount()];
                       buffer.read(bytes);
                       return bytes;
                   });

        Flux<String> partialTranscripts =
            geminiService.streamTranscription(audioChunks);

        return session.send(
            partialTranscripts.map(session::textMessage)
        );
    }
}
