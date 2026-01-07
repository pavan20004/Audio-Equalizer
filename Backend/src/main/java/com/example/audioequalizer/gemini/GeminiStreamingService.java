package com.example.audioequalizer.gemini;

import java.time.Duration;

import org.springframework.stereotype.Service;

import reactor.core.publisher.Flux;

@Service
public class GeminiStreamingService {

    public Flux<String> streamTranscription(Flux<byte[]> audioStream) {

    	return audioStream
    		    .index()
    		    .map(tuple -> "Partial transcript chunk " + tuple.getT1())
    		    .delayElements(Duration.ofMillis(10));

    }
}

